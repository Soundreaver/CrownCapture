// Zustand store for Crown and Capture game state management

import { create } from "zustand";
import {
  GameStore,
  Position,
  Piece,
  PieceType,
  Team,
  GameState,
  GameMode,
  DEFAULT_PIECE_STATS,
  positionsEqual,
  Move,
} from "../types/game.types";
import { ChessRules } from "../game/ChessRules";
import { PIECE_ABILITIES } from "../types/abilities.types";
import { AbilitySystem } from "../game/AbilitySystem";
import { ChessAI, AIDifficulty } from "../game/ChessAI";
import { playSound, initializeAudio } from "../audio/SoundManager";

// Helper function to create initial piece
const createPiece = (
  id: string,
  type: PieceType,
  team: Team,
  position: Position
): Piece => {
  const baseStats = DEFAULT_PIECE_STATS[type];
  return {
    id,
    type,
    team,
    position,
    stats: {
      ...baseStats,
      currentHp: baseStats.maxHp,
      currentMana: baseStats.maxMana,
    },
    hasMoved: false,
    isAlive: true,

    // RPG elements
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    abilities: PIECE_ABILITIES[type] || [],
    statusEffects: [],
    equipment: {},
    skillPoints: 0,
  };
};

// Create initial board setup
const createInitialBoard = (): (Piece | null)[][] => {
  const board: (Piece | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  // Setup pawns
  for (let x = 0; x < 8; x++) {
    board[1][x] = createPiece(`black-pawn-${x}`, PieceType.PAWN, Team.BLACK, {
      x,
      y: 1,
    });
    board[6][x] = createPiece(`white-pawn-${x}`, PieceType.PAWN, Team.WHITE, {
      x,
      y: 6,
    });
  }

  // Setup other pieces
  const pieceOrder = [
    PieceType.ROOK,
    PieceType.KNIGHT,
    PieceType.BISHOP,
    PieceType.QUEEN,
    PieceType.KING,
    PieceType.BISHOP,
    PieceType.KNIGHT,
    PieceType.ROOK,
  ];

  for (let x = 0; x < 8; x++) {
    board[0][x] = createPiece(
      `black-${pieceOrder[x]}-${x}`,
      pieceOrder[x],
      Team.BLACK,
      { x, y: 0 }
    );
    board[7][x] = createPiece(
      `white-${pieceOrder[x]}-${x}`,
      pieceOrder[x],
      Team.WHITE,
      { x, y: 7 }
    );
  }

  return board;
};

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  board: createInitialBoard(),
  currentTurn: Team.WHITE,
  selectedPiece: null,
  validMoves: [],
  highlightedSquares: [],
  pieceStats: new Map(),
  abilities: new Map(),
  cooldowns: new Map(),
  gameState: GameState.MENU,
  gameMode: GameMode.CLASSIC,
  winner: null,
  moveHistory: [],
  turnCount: 1,
  timeRemaining: undefined,
  activeEffects: [],
  ai: null,
  isAIThinking: false,

  // Initialize audio when store is created
  init: () => {
    initializeAudio();
  },

  // Actions
  selectPiece: (position: Position) => {
    const state = get();
    const piece = state.board[position.y][position.x];

    // Can only select pieces of the current player's team
    if (!piece || piece.team !== state.currentTurn || !piece.isAlive) {
      set({ selectedPiece: null, validMoves: [], highlightedSquares: [] });
      return;
    }

    const validMoves = ChessRules.getValidMoves(piece, state.board);

    set({
      selectedPiece: position,
      validMoves,
      highlightedSquares: validMoves,
    });
  },

  movePiece: (from: Position, to: Position) => {
    const state = get();
    const piece = state.board[from.y][from.x];

    if (!piece || !ChessRules.isMoveValid(piece, to, state.board)) {
      return;
    }

    const newBoard = state.board.map((row) => [...row]);
    const targetPiece = newBoard[to.y][to.x];

    // Handle castling
    if (ChessRules.isCastlingMove(piece, to)) {
      ChessRules.executeCastling(piece, to, newBoard);
      // Add castling effect
      get().addEffect({
        type: 'teleport',
        position: from,
        target: to,
        duration: 1500
      });
    }

    // Create move record
    const move: Move = {
      from,
      to,
      piece: { ...piece },
      capturedPiece: targetPiece ? { ...targetPiece } : undefined,
      timestamp: Date.now(),
    };

    // Handle capture with RPG mechanics
    if (targetPiece) {
      // In RPG mode, deal damage instead of instant capture
      const damage = piece.stats.attackPower;
      const newHp = targetPiece.stats.currentHp - damage;

      if (newHp <= 0) {
        // Piece is destroyed
        targetPiece.isAlive = false;
        newBoard[to.y][to.x] = null;
        move.damage = damage;
      } else {
        // Piece survives, update HP but no counter-attack
        targetPiece.stats.currentHp = newHp;
        move.damage = damage;
      }
    }

    // Move the piece
    piece.position = to;
    piece.hasMoved = true;
    newBoard[to.y][to.x] = piece;
    newBoard[from.y][from.x] = null;

    // Play appropriate sound and add effects
    if (move.capturedPiece) {
      playSound('capture');
      get().addEffect({
        type: 'capture',
        position: to,
        duration: 1500
      });
    } else {
      playSound('move');
    }

    // Check for game end conditions
    let winner = null;
    const opposingTeam = state.currentTurn === Team.WHITE ? Team.BLACK : Team.WHITE;
    
    if (ChessRules.isCheckmate(opposingTeam, newBoard)) {
      winner = state.currentTurn;
      playSound('checkmate');
    } else if (ChessRules.isKingInCheck(opposingTeam, newBoard)) {
      playSound('check');
    }

    set({
      board: newBoard,
      selectedPiece: null,
      validMoves: [],
      highlightedSquares: [],
      moveHistory: [...state.moveHistory, move],
      winner,
      gameState: winner ? GameState.GAME_OVER : state.gameState,
    });

    // End turn after move
    get().endTurn();
    
    // If it's now AI's turn, make AI move
    const newState = get();
    if (newState.ai && newState.currentTurn === newState.ai.team) {
      setTimeout(() => {
        get().makeAIMove();
      }, 1000); // Small delay for better UX
    }
  },

  useAbility: (pieceId: string, abilityId: string, target?: Position) => {
    const state = get();

    // Find the piece that's using the ability
    let caster: Piece | null = null;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = state.board[y][x];
        if (piece && piece.id === pieceId) {
          caster = piece;
          break;
        }
      }
    }

    if (!caster || caster.team !== state.currentTurn) {
      return;
    }

    // Find the ability
    const ability = caster.abilities.find((a) => a.id === abilityId);
    if (!ability) {
      return;
    }

    // If no target specified and ability needs a target, enter targeting mode
    if (!target && ability.targetType !== "SELF") {
      const validTargets = AbilitySystem.getValidTargets(
        caster,
        ability,
        state.board
      );
      set({
        gameState: GameState.ABILITY_TARGETING,
        selectedPiece: caster.position,
        highlightedSquares: validTargets,
      });
      return;
    }

    // Use self as target for self-targeting abilities
    const targetPos = target || caster.position;

    // Execute the ability
    const result = AbilitySystem.executeAbility(
      caster,
      ability,
      targetPos,
      state.board
    );

    if (result.success) {
      // Update the board with ability results
      set({
        board: result.board,
        gameState: GameState.PLAYING,
        selectedPiece: null,
        highlightedSquares: [],
        validMoves: [],
      });

      // Log ability messages (could be displayed in UI later)
      console.log(result.messages.join("\n"));
    }
  },

  endTurn: () => {
    const state = get();
    const newTurn = state.currentTurn === Team.WHITE ? Team.BLACK : Team.WHITE;

    // Regenerate mana for all pieces of the new turn
    const newBoard = state.board.map((row) =>
      row.map((piece) => {
        if (piece && piece.team === newTurn && piece.isAlive) {
          const newMana = Math.min(
            piece.stats.maxMana,
            piece.stats.currentMana + 10 // Regenerate 10 mana per turn
          );
          return {
            ...piece,
            stats: {
              ...piece.stats,
              currentMana: newMana,
            },
          };
        }
        return piece;
      })
    );

    // Reduce temporary HP duration
    const updatedBoard = newBoard.map((row) =>
      row.map((piece) => {
        if (piece && piece.stats.tempHpTurns && piece.stats.tempHpTurns > 0) {
          const newTempHpTurns = piece.stats.tempHpTurns - 1;
          if (newTempHpTurns <= 0) {
            // Remove temporary HP
            return {
              ...piece,
              stats: {
                ...piece.stats,
                tempHp: undefined,
                tempHpTurns: undefined,
              },
            };
          } else {
            return {
              ...piece,
              stats: {
                ...piece.stats,
                tempHpTurns: newTempHpTurns,
              },
            };
          }
        }
        return piece;
      })
    );

    set({
      board: updatedBoard,
      currentTurn: newTurn,
      turnCount: state.turnCount + 1,
      selectedPiece: null,
      validMoves: [],
      highlightedSquares: [],
    });
  },

  resetGame: () => {
    set({
      board: createInitialBoard(),
      currentTurn: Team.WHITE,
      selectedPiece: null,
      validMoves: [],
      highlightedSquares: [],
      pieceStats: new Map(),
      abilities: new Map(),
      cooldowns: new Map(),
      gameState: GameState.PLAYING,
      winner: null,
      moveHistory: [],
      turnCount: 1,
      activeEffects: [],
    });
  },

  setGameState: (gameState: GameState) => {
    set({ gameState });
  },

  setGameMode: (gameMode: GameMode) => {
    set({ gameMode });
  },

  addEffect: (effect: {
    type: string;
    position: Position;
    target?: Position;
    duration?: number;
  }) => {
    const state = get();
    set({
      activeEffects: [...state.activeEffects, effect],
    });

    // Remove effect after duration
    setTimeout(() => {
      const currentState = get();
      set({
      activeEffects: currentState.activeEffects.filter((e) => e !== effect),
    });
  }, effect.duration || 2000);
},

startAIGame: (difficulty: AIDifficulty) => {
  const ai = new ChessAI(difficulty, Team.BLACK);
  set({
    board: createInitialBoard(),
    currentTurn: Team.WHITE,
    selectedPiece: null,
    validMoves: [],
    highlightedSquares: [],
    gameState: GameState.PLAYING,
    winner: null,
    moveHistory: [],
    turnCount: 1,
    activeEffects: [],
    ai,
    isAIThinking: false,
  });
},

makeAIMove: async () => {
  const state = get();
  if (!state.ai || state.currentTurn !== state.ai.team || state.isAIThinking) {
    return;
  }

  set({ isAIThinking: true });

  try {
    const aiMove = state.ai.getBestMove(state.board);
    if (aiMove) {
      // Execute the AI move
      get().movePiece(aiMove.from, aiMove.to);
    }
  } catch (error) {
    console.error('AI move error:', error);
  } finally {
    set({ isAIThinking: false });
  }
},
}));

// Helper hooks for accessing specific parts of the store
export const useCurrentTurn = () => useGameStore((state) => state.currentTurn);
export const useBoard = () => useGameStore((state) => state.board);
export const useSelectedPiece = () =>
  useGameStore((state) => state.selectedPiece);
export const useValidMoves = () => useGameStore((state) => state.validMoves);
export const useGameState = () => useGameStore((state) => state.gameState);
export const useWinner = () => useGameStore((state) => state.winner);
export const useMoveHistory = () => useGameStore((state) => state.moveHistory);
