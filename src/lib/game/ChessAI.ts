// Chess AI implementation with different difficulty levels

import { ChessRules } from './ChessRules';
import { 
  Piece, 
  Position, 
  Team, 
  PieceType, 
  positionsEqual 
} from '../types/game.types';

interface AIMove {
  from: Position;
  to: Position;
  score: number;
  piece: Piece;
}

interface BoardEvaluation {
  score: number;
  isGameOver: boolean;
  winner?: Team;
}

export enum AIDifficulty {
  EASY = 1,
  MEDIUM = 3,
  HARD = 5,
  EXPERT = 7
}

export class ChessAI {
  private difficulty: AIDifficulty;
  private team: Team;

  // Piece values for evaluation
  private static readonly PIECE_VALUES = {
    [PieceType.PAWN]: 100,
    [PieceType.KNIGHT]: 320,
    [PieceType.BISHOP]: 330,
    [PieceType.ROOK]: 500,
    [PieceType.QUEEN]: 900,
    [PieceType.KING]: 20000
  };

  // Position bonuses for different pieces
  private static readonly POSITION_BONUSES = {
    [PieceType.PAWN]: [
      [0,  0,  0,  0,  0,  0,  0,  0],
      [50, 50, 50, 50, 50, 50, 50, 50],
      [10, 10, 20, 30, 30, 20, 10, 10],
      [5,  5, 10, 25, 25, 10,  5,  5],
      [0,  0,  0, 20, 20,  0,  0,  0],
      [5, -5,-10,  0,  0,-10, -5,  5],
      [5, 10, 10,-20,-20, 10, 10,  5],
      [0,  0,  0,  0,  0,  0,  0,  0]
    ],
    [PieceType.KNIGHT]: [
      [-50,-40,-30,-30,-30,-30,-40,-50],
      [-40,-20,  0,  0,  0,  0,-20,-40],
      [-30,  0, 10, 15, 15, 10,  0,-30],
      [-30,  5, 15, 20, 20, 15,  5,-30],
      [-30,  0, 15, 20, 20, 15,  0,-30],
      [-30,  5, 10, 15, 15, 10,  5,-30],
      [-40,-20,  0,  5,  5,  0,-20,-40],
      [-50,-40,-30,-30,-30,-30,-40,-50]
    ]
  };

  constructor(difficulty: AIDifficulty, team: Team) {
    this.difficulty = difficulty;
    this.team = team;
  }

  /**
   * Get the best move for the AI
   */
  getBestMove(board: (Piece | null)[][]): AIMove | null {
    const startTime = Date.now();
    
    // Use iterative deepening for better time management
    let bestMove: AIMove | null = null;
    let depth = 1;
    
    while (depth <= this.difficulty && (Date.now() - startTime) < 5000) {
      const result = this.minimax(board, depth, -Infinity, Infinity, true);
      if (result) {
        bestMove = result;
      }
      depth++;
    }

    // Add some randomness for easier difficulties
    if (this.difficulty <= AIDifficulty.MEDIUM && bestMove) {
      const allMoves = this.getAllPossibleMoves(board);
      if (allMoves.length > 0 && Math.random() < 0.3) {
        // 30% chance to make a random move on easier difficulties
        const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
        return randomMove;
      }
    }

    return bestMove;
  }

  /**
   * Minimax algorithm with alpha-beta pruning
   */
  private minimax(
    board: (Piece | null)[][],
    depth: number,
    alpha: number,
    beta: number,
    maximizing: boolean
  ): AIMove | null {
    if (depth === 0) {
      const evaluation = this.evaluateBoard(board);
      return null; // No move at leaf node
    }

    const currentTeam = maximizing ? this.team : (this.team === Team.WHITE ? Team.BLACK : Team.WHITE);
    const moves = this.getAllPossibleMoves(board, currentTeam);

    if (moves.length === 0) {
      return null; // No moves available
    }

    let bestMove: AIMove | null = null;

    if (maximizing) {
      let maxScore = -Infinity;
      
      for (const move of moves) {
        const newBoard = this.makeMove(board, move);
        const childMove = this.minimax(newBoard, depth - 1, alpha, beta, false);
        const score = this.evaluateBoard(newBoard).score;

        if (score > maxScore) {
          maxScore = score;
          bestMove = { ...move, score };
        }

        alpha = Math.max(alpha, score);
        if (beta <= alpha) {
          break; // Alpha-beta pruning
        }
      }
    } else {
      let minScore = Infinity;
      
      for (const move of moves) {
        const newBoard = this.makeMove(board, move);
        const childMove = this.minimax(newBoard, depth - 1, alpha, beta, true);
        const score = this.evaluateBoard(newBoard).score;

        if (score < minScore) {
          minScore = score;
          bestMove = { ...move, score };
        }

        beta = Math.min(beta, score);
        if (beta <= alpha) {
          break; // Alpha-beta pruning
        }
      }
    }

    return bestMove;
  }

  /**
   * Get all possible moves for a team
   */
  private getAllPossibleMoves(board: (Piece | null)[][], team?: Team): AIMove[] {
    const moves: AIMove[] = [];
    const targetTeam = team || this.team;

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board[y][x];
        if (piece && piece.team === targetTeam && piece.isAlive) {
          const validMoves = ChessRules.getValidMoves(piece, board);
          
          for (const to of validMoves) {
            moves.push({
              from: piece.position,
              to,
              score: 0,
              piece
            });
          }
        }
      }
    }

    return moves;
  }

  /**
   * Make a move on a copy of the board
   */
  private makeMove(board: (Piece | null)[][], move: AIMove): (Piece | null)[][] {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[move.from.y][move.from.x];
    
    if (piece) {
      // Handle castling
      if (ChessRules.isCastlingMove(piece, move.to)) {
        ChessRules.executeCastling(piece, move.to, newBoard);
      }
      
      // Move piece
      const movedPiece = { ...piece, position: move.to, hasMoved: true };
      newBoard[move.to.y][move.to.x] = movedPiece;
      newBoard[move.from.y][move.from.x] = null;
    }

    return newBoard;
  }

  /**
   * Evaluate the board position
   */
  private evaluateBoard(board: (Piece | null)[][]): BoardEvaluation {
    let score = 0;
    let whiteKing = false;
    let blackKing = false;

    // Material and position evaluation
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board[y][x];
        if (piece && piece.isAlive) {
          const pieceValue = ChessAI.PIECE_VALUES[piece.type];
          const positionBonus = this.getPositionBonus(piece, x, y);
          const totalValue = pieceValue + positionBonus;

          if (piece.team === Team.WHITE) {
            score += totalValue;
            if (piece.type === PieceType.KING) whiteKing = true;
          } else {
            score -= totalValue;
            if (piece.type === PieceType.KING) blackKing = true;
          }

          // RPG stats bonus
          if (piece.stats) {
            const hpRatio = piece.stats.currentHp / piece.stats.maxHp;
            const statBonus = (piece.stats.attackPower + piece.stats.defense) * hpRatio;
            
            if (piece.team === Team.WHITE) {
              score += statBonus;
            } else {
              score -= statBonus;
            }
          }
        }
      }
    }

    // Check for game over conditions
    let winner: Team | undefined;
    let isGameOver = false;

    if (!whiteKing) {
      winner = Team.BLACK;
      isGameOver = true;
    } else if (!blackKing) {
      winner = Team.WHITE;
      isGameOver = true;
    } else {
      // Check for checkmate
      if (ChessRules.isCheckmate(Team.WHITE, board)) {
        winner = Team.BLACK;
        isGameOver = true;
        score -= 50000; // Huge penalty for being checkmated
      } else if (ChessRules.isCheckmate(Team.BLACK, board)) {
        winner = Team.WHITE;
        isGameOver = true;
        score += 50000; // Huge bonus for checkmating
      } else if (ChessRules.isStalemate(Team.WHITE, board) || ChessRules.isStalemate(Team.BLACK, board)) {
        isGameOver = true;
        score = 0; // Stalemate is neutral
      }
    }

    // Adjust score based on AI team perspective
    if (this.team === Team.BLACK) {
      score = -score;
    }

    // Add some strategic bonuses
    score += this.evaluateKingSafety(board);
    score += this.evaluatePawnStructure(board);
    score += this.evaluateControl(board);

    return {
      score,
      isGameOver,
      winner
    };
  }

  /**
   * Get position bonus for a piece
   */
  private getPositionBonus(piece: Piece, x: number, y: number): number {
    const bonusTable = ChessAI.POSITION_BONUSES[piece.type as keyof typeof ChessAI.POSITION_BONUSES];
    if (!bonusTable) return 0;

    // Flip the table for black pieces
    const adjustedY = piece.team === Team.WHITE ? 7 - y : y;
    return bonusTable[adjustedY]?.[x] || 0;
  }

  /**
   * Evaluate king safety
   */
  private evaluateKingSafety(board: (Piece | null)[][]): number {
    let score = 0;
    
    // Find kings and evaluate their safety
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board[y][x];
        if (piece && piece.type === PieceType.KING) {
          const isInCheck = ChessRules.isKingInCheck(piece.team, board);
          const safetyScore = isInCheck ? -50 : 10;
          
          if (piece.team === this.team) {
            score += safetyScore;
          } else {
            score -= safetyScore;
          }
        }
      }
    }
    
    return score;
  }

  /**
   * Evaluate pawn structure
   */
  private evaluatePawnStructure(board: (Piece | null)[][]): number {
    let score = 0;
    
    // Count doubled pawns, isolated pawns, etc.
    const whitePawns: number[] = Array(8).fill(0);
    const blackPawns: number[] = Array(8).fill(0);
    
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board[y][x];
        if (piece && piece.type === PieceType.PAWN) {
          if (piece.team === Team.WHITE) {
            whitePawns[x]++;
          } else {
            blackPawns[x]++;
          }
        }
      }
    }
    
    // Penalize doubled pawns
    for (let x = 0; x < 8; x++) {
      if (whitePawns[x] > 1) score -= 10 * (whitePawns[x] - 1);
      if (blackPawns[x] > 1) score += 10 * (blackPawns[x] - 1);
    }
    
    return this.team === Team.WHITE ? score : -score;
  }

  /**
   * Evaluate board control
   */
  private evaluateControl(board: (Piece | null)[][]): number {
    let score = 0;
    
    // Count mobility (number of possible moves)
    const whiteMoves = this.getAllPossibleMoves(board, Team.WHITE).length;
    const blackMoves = this.getAllPossibleMoves(board, Team.BLACK).length;
    
    const mobilityScore = (whiteMoves - blackMoves) * 2;
    return this.team === Team.WHITE ? mobilityScore : -mobilityScore;
  }

  /**
   * Get difficulty name for display
   */
  static getDifficultyName(difficulty: AIDifficulty): string {
    switch (difficulty) {
      case AIDifficulty.EASY: return 'Easy';
      case AIDifficulty.MEDIUM: return 'Medium';
      case AIDifficulty.HARD: return 'Hard';
      case AIDifficulty.EXPERT: return 'Expert';
      default: return 'Unknown';
    }
  }
}
