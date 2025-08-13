// Ability system types for Crown and Capture

import { Position, Team, PieceType } from "./game.types";

export enum AbilityType {
  ACTIVE = "ACTIVE",
  PASSIVE = "PASSIVE",
  ULTIMATE = "ULTIMATE",
}

export enum TargetType {
  SELF = "SELF",
  ALLY = "ALLY",
  ENEMY = "ENEMY",
  EMPTY_SQUARE = "EMPTY_SQUARE",
  ANY_SQUARE = "ANY_SQUARE",
  AOE = "AOE",
}

export enum StatusEffectType {
  BUFF = "BUFF",
  DEBUFF = "DEBUFF",
  DOT = "DOT", // Damage over time
  HOT = "HOT", // Heal over time
}

export interface StatusEffect {
  id: string;
  name: string;
  type: StatusEffectType;
  description: string;
  duration: number; // turns remaining
  value: number; // effect strength
  icon: string;
  stackable: boolean;
  onApply?: (pieceId: string) => void;
  onRemove?: (pieceId: string) => void;
  onTurnStart?: (pieceId: string) => void;
  onTurnEnd?: (pieceId: string) => void;
}

export interface AbilityEffect {
  type:
    | "damage"
    | "heal"
    | "buff"
    | "debuff"
    | "teleport"
    | "summon"
    | "transform";
  value?: number;
  statusEffect?: StatusEffect;
  range?: number;
  areaOfEffect?: number;
  duration?: number;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  type: AbilityType;
  manaCost: number;
  cooldown: number;
  currentCooldown?: number;
  range: number;
  targetType: TargetType;
  effects: AbilityEffect[];
  icon: string;
  levelRequirement: number;

  // Targeting and validation
  canTarget: (
    casterPos: Position,
    targetPos: Position,
    board: any[][]
  ) => boolean;
  execute: (casterId: string, targetPos?: Position, board?: any[][]) => void;
}

// Predefined abilities for each piece type
export const PIECE_ABILITIES: Record<PieceType, Ability[]> = {
  [PieceType.PAWN]: [
    {
      id: "pawn_charge",
      name: "Shield Wall",
      description: "Gain +2 Defense and immunity to ranged attacks for 3 turns",
      type: AbilityType.ACTIVE,
      manaCost: 20,
      cooldown: 5,
      range: 0,
      targetType: TargetType.SELF,
      icon: "🛡️",
      levelRequirement: 1,
      effects: [
        {
          type: "buff",
          statusEffect: {
            id: "shield_wall",
            name: "Shield Wall",
            type: StatusEffectType.BUFF,
            description: "+2 Defense, immunity to ranged attacks",
            duration: 3,
            value: 2,
            icon: "🛡️",
            stackable: false,
          },
        },
      ],
      canTarget: () => true,
      execute: () => {},
    },
    {
      id: "pawn_heal",
      name: "Field Medic",
      description: "Heal an adjacent ally for 25 HP",
      type: AbilityType.ACTIVE,
      manaCost: 15,
      cooldown: 3,
      range: 1,
      targetType: TargetType.ALLY,
      icon: "❤️",
      levelRequirement: 3,
      effects: [
        {
          type: "heal",
          value: 25,
        },
      ],
      canTarget: () => true,
      execute: () => {},
    },
  ],

  [PieceType.KNIGHT]: [
    {
      id: "knight_leap",
      name: "Lightning Strike",
      description:
        "Teleport to target location and deal 40 damage to adjacent enemies",
      type: AbilityType.ACTIVE,
      manaCost: 30,
      cooldown: 4,
      range: 5,
      targetType: TargetType.EMPTY_SQUARE,
      icon: "⚡",
      levelRequirement: 1,
      effects: [
        {
          type: "teleport",
        },
        {
          type: "damage",
          value: 40,
          areaOfEffect: 1,
        },
      ],
      canTarget: () => true,
      execute: () => {},
    },
    {
      id: "knight_rally",
      name: "Battle Cry",
      description: "Grant +5 Attack to all nearby allies for 4 turns",
      type: AbilityType.ACTIVE,
      manaCost: 40,
      cooldown: 6,
      range: 2,
      targetType: TargetType.AOE,
      icon: "📯",
      levelRequirement: 5,
      effects: [
        {
          type: "buff",
          statusEffect: {
            id: "battle_cry",
            name: "Battle Cry",
            type: StatusEffectType.BUFF,
            description: "+5 Attack Power",
            duration: 4,
            value: 5,
            icon: "📯",
            stackable: false,
          },
          areaOfEffect: 2,
        },
      ],
      canTarget: () => true,
      execute: () => {},
    },
  ],

  [PieceType.BISHOP]: [
    {
      id: "bishop_heal",
      name: "Divine Light",
      description: "Heal target ally for 50 HP and cleanse all debuffs",
      type: AbilityType.ACTIVE,
      manaCost: 35,
      cooldown: 4,
      range: 8,
      targetType: TargetType.ALLY,
      icon: "✨",
      levelRequirement: 1,
      effects: [
        {
          type: "heal",
          value: 50,
        },
      ],
      canTarget: () => true,
      execute: () => {},
    },
    {
      id: "bishop_smite",
      name: "Holy Smite",
      description: "Deal 60 magic damage to target enemy, ignoring armor",
      type: AbilityType.ACTIVE,
      manaCost: 45,
      cooldown: 5,
      range: 8,
      targetType: TargetType.ENEMY,
      icon: "⚡",
      levelRequirement: 4,
      effects: [
        {
          type: "damage",
          value: 60,
        },
      ],
      canTarget: () => true,
      execute: () => {},
    },
  ],

  [PieceType.ROOK]: [
    {
      id: "rook_barrage",
      name: "Artillery Barrage",
      description: "Deal 35 damage to all enemies in a straight line",
      type: AbilityType.ACTIVE,
      manaCost: 40,
      cooldown: 5,
      range: 8,
      targetType: TargetType.ANY_SQUARE,
      icon: "💥",
      levelRequirement: 1,
      effects: [
        {
          type: "damage",
          value: 35,
        },
      ],
      canTarget: () => true,
      execute: () => {},
    },
    {
      id: "rook_fortress",
      name: "Mobile Fortress",
      description:
        "Become immobile but gain massive defense and ranged attacks",
      type: AbilityType.ACTIVE,
      manaCost: 50,
      cooldown: 8,
      range: 0,
      targetType: TargetType.SELF,
      icon: "🏰",
      levelRequirement: 6,
      effects: [
        {
          type: "buff",
          statusEffect: {
            id: "fortress_mode",
            name: "Fortress Mode",
            type: StatusEffectType.BUFF,
            description: "Immobile, +10 Defense, ranged attacks",
            duration: 5,
            value: 10,
            icon: "🏰",
            stackable: false,
          },
        },
      ],
      canTarget: () => true,
      execute: () => {},
    },
  ],

  [PieceType.QUEEN]: [
    {
      id: "queen_teleport",
      name: "Royal Decree",
      description: "Teleport any ally to an empty square within range",
      type: AbilityType.ACTIVE,
      manaCost: 50,
      cooldown: 6,
      range: 8,
      targetType: TargetType.ALLY,
      icon: "👑",
      levelRequirement: 1,
      effects: [
        {
          type: "teleport",
        },
      ],
      canTarget: () => true,
      execute: () => {},
    },
    {
      id: "queen_dominate",
      name: "Mind Control",
      description: "Take control of target enemy piece for 2 turns",
      type: AbilityType.ULTIMATE,
      manaCost: 80,
      cooldown: 10,
      range: 5,
      targetType: TargetType.ENEMY,
      icon: "🧠",
      levelRequirement: 8,
      effects: [
        {
          type: "debuff",
          statusEffect: {
            id: "mind_control",
            name: "Mind Control",
            type: StatusEffectType.DEBUFF,
            description: "Controlled by enemy",
            duration: 2,
            value: 0,
            icon: "🧠",
            stackable: false,
          },
        },
      ],
      canTarget: () => true,
      execute: () => {},
    },
  ],

  [PieceType.KING]: [
    {
      id: "king_inspire",
      name: "Royal Inspiration",
      description: "All allies gain +3 to all stats for 5 turns",
      type: AbilityType.ACTIVE,
      manaCost: 60,
      cooldown: 8,
      range: 0,
      targetType: TargetType.AOE,
      icon: "👑",
      levelRequirement: 1,
      effects: [
        {
          type: "buff",
          statusEffect: {
            id: "royal_inspiration",
            name: "Royal Inspiration",
            type: StatusEffectType.BUFF,
            description: "+3 to all stats",
            duration: 5,
            value: 3,
            icon: "👑",
            stackable: false,
          },
          areaOfEffect: 8,
        },
      ],
      canTarget: () => true,
      execute: () => {},
    },
    {
      id: "king_sanctuary",
      name: "Divine Sanctuary",
      description: "Create a 3x3 healing zone that lasts 6 turns",
      type: AbilityType.ULTIMATE,
      manaCost: 100,
      cooldown: 12,
      range: 3,
      targetType: TargetType.EMPTY_SQUARE,
      icon: "🕊️",
      levelRequirement: 10,
      effects: [
        {
          type: "heal",
          value: 15,
          areaOfEffect: 1,
          duration: 6,
        },
      ],
      canTarget: () => true,
      execute: () => {},
    },
  ],
};
