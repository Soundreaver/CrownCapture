// Core game types for Crown and Capture

import { Ability, StatusEffect } from "./abilities.types";
import { EquippedItems } from "./equipment.types";

export enum GameState {
  MENU = "MENU",
  PLAYING = "PLAYING",
  PAUSED = "PAUSED",
  ABILITY_TARGETING = "ABILITY_TARGETING",
  ANIMATING = "ANIMATING",
  GAME_OVER = "GAME_OVER",
}

export enum GameMode {
  CLASSIC = "CLASSIC",
  BLITZ = "BLITZ",
  CAMPAIGN = "CAMPAIGN",
  PRACTICE = "PRACTICE",
}

export enum PieceType {
  PAWN = "pawn",
  KNIGHT = "knight",
  BISHOP = "bishop",
  ROOK = "rook",
  QUEEN = "queen",
  KING = "king",
}

export enum Team {
  WHITE = "white",
  BLACK = "black",
}

export interface Position {
  x: number;
  y: number;
}

export interface PieceStats {
  maxHp: number;
  currentHp: number;
  maxMana: number;
  currentMana: number;
  attackPower: number;
  defense: number;
  speed: number;
  magicPower: number;
  criticalChance: number;
  criticalDamage: number;
  tempHp?: number;
  tempHpTurns?: number;
}

export interface Piece {
  id: string;
  type: PieceType;
  team: Team;
  position: Position;
  stats: PieceStats;
  hasMoved: boolean;
  isAlive: boolean;

  // RPG elements
  level: number;
  experience: number;
  experienceToNextLevel: number;
  abilities: Ability[];
  statusEffects: StatusEffect[];
  equipment: EquippedItems;
  skillPoints: number;
}

export interface AbilityData {
  id: string;
  name: string;
  manaCost: number;
  cooldown: number;
  currentCooldown: number;
  range: "diagonal" | "straight" | "knight" | "adjacent" | "any" | "self";
  targetType: "enemy" | "ally" | "any" | "empty" | "self";
  description: string;
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  capturedPiece?: Piece;
  damage?: number;
  ability?: string;
  timestamp: number;
}

export interface GameStore {
  // Board state
  board: (Piece | null)[][];
  currentTurn: Team;
  selectedPiece: Position | null;
  validMoves: Position[];
  highlightedSquares: Position[];

  // RPG state
  pieceStats: Map<string, any>;
  abilities: Map<string, any>;
  cooldowns: Map<string, number>;

  // Game flow
  gameState: GameState;
  gameMode: GameMode;
  winner: Team | null;
  moveHistory: Move[];
  turnCount: number;
  timeRemaining?: number; // For blitz mode
  activeEffects: Array<{
    type: string;
    position: Position;
    target?: Position;
    duration?: number;
  }>;

  // Actions
  init: () => void;
  selectPiece: (position: Position) => void;
  movePiece: (from: Position, to: Position) => void;
  activateAbility: (pieceId: string, abilityId: string, target?: Position) => void;
  endTurn: () => void;
  resetGame: () => void;
  setGameState: (gameState: GameState) => void;
  setGameMode: (gameMode: GameMode) => void;
  addEffect: (effect: {
    type: string;
    position: Position;
    target?: Position;
    duration?: number;
  }) => void;
  
  // AI support
  ai: any; // ChessAI instance
  isAIThinking: boolean;
  startAIGame: (difficulty: any) => void; // AIDifficulty
  makeAIMove: () => Promise<void>;
}

// Default piece stats as defined in the PDF
export const DEFAULT_PIECE_STATS: Record<
  PieceType,
  Omit<PieceStats, "currentHp" | "currentMana">
> = {
  [PieceType.PAWN]: {
    maxHp: 50,
    maxMana: 100,
    attackPower: 20,
    defense: 5,
    speed: 3,
    magicPower: 5,
    criticalChance: 5,
    criticalDamage: 50,
  },
  [PieceType.KNIGHT]: {
    maxHp: 75,
    maxMana: 100,
    attackPower: 30,
    defense: 8,
    speed: 6,
    magicPower: 8,
    criticalChance: 15,
    criticalDamage: 75,
  },
  [PieceType.BISHOP]: {
    maxHp: 70,
    maxMana: 100,
    attackPower: 25,
    defense: 6,
    speed: 4,
    magicPower: 20,
    criticalChance: 10,
    criticalDamage: 60,
  },
  [PieceType.ROOK]: {
    maxHp: 100,
    maxMana: 100,
    attackPower: 35,
    defense: 12,
    speed: 2,
    magicPower: 5,
    criticalChance: 8,
    criticalDamage: 80,
  },
  [PieceType.QUEEN]: {
    maxHp: 120,
    maxMana: 100,
    attackPower: 40,
    defense: 10,
    speed: 5,
    magicPower: 25,
    criticalChance: 20,
    criticalDamage: 90,
  },
  [PieceType.KING]: {
    maxHp: 150,
    maxMana: 100,
    attackPower: 30,
    defense: 15,
    speed: 3,
    magicPower: 15,
    criticalChance: 12,
    criticalDamage: 70,
  },
};

// Helper functions for position manipulation
export const positionToKey = (pos: Position): string => `${pos.x},${pos.y}`;
export const keyToPosition = (key: string): Position => {
  const [x, y] = key.split(",").map(Number);
  return { x, y };
};

export const isValidPosition = (pos: Position): boolean => {
  return pos.x >= 0 && pos.x < 8 && pos.y >= 0 && pos.y < 8;
};

export const positionsEqual = (pos1: Position, pos2: Position): boolean => {
  return pos1.x === pos2.x && pos1.y === pos2.y;
};
