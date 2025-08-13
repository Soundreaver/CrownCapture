// Ability system implementation for Crown and Capture

import {
  Position,
  Piece,
  Team,
  PieceType,
  isValidPosition,
  positionsEqual,
} from "../types/game.types";
import {
  Ability,
  AbilityType,
  TargetType,
  StatusEffect,
  StatusEffectType,
  PIECE_ABILITIES,
} from "../types/abilities.types";

export class AbilitySystem {
  /**
   * Check if a piece can use an ability
   */
  static canUseAbility(
    piece: Piece,
    ability: Ability
  ): { canUse: boolean; reason?: string } {
    // Check if piece is alive
    if (!piece.isAlive) {
      return { canUse: false, reason: "Piece is not alive" };
    }

    // Check mana requirement
    if (piece.stats.currentMana < ability.manaCost) {
      return { canUse: false, reason: "Not enough mana" };
    }

    // Check cooldown
    if (ability.currentCooldown && ability.currentCooldown > 0) {
      return { canUse: false, reason: "Ability is on cooldown" };
    }

    // Check level requirement
    if (piece.level < ability.levelRequirement) {
      return { canUse: false, reason: "Level requirement not met" };
    }

    return { canUse: true };
  }

  /**
   * Get valid targets for an ability
   */
  static getValidTargets(
    caster: Piece,
    ability: Ability,
    board: (Piece | null)[][]
  ): Position[] {
    const validTargets: Position[] = [];

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const targetPos = { x, y };

        if (this.isValidTarget(caster, ability, targetPos, board)) {
          validTargets.push(targetPos);
        }
      }
    }

    return validTargets;
  }

  /**
   * Check if a specific position is a valid target for an ability
   */
  static isValidTarget(
    caster: Piece,
    ability: Ability,
    targetPos: Position,
    board: (Piece | null)[][]
  ): boolean {
    // Check if position is on the board
    if (!isValidPosition(targetPos)) {
      return false;
    }

    // Check range
    const distance = this.getDistance(caster.position, targetPos);
    if (distance > ability.range) {
      return false;
    }

    const targetPiece = board[targetPos.y][targetPos.x];

    // Check target type requirements
    switch (ability.targetType) {
      case TargetType.SELF:
        return positionsEqual(caster.position, targetPos);

      case TargetType.ALLY:
        return !!(
          targetPiece &&
          targetPiece.team === caster.team &&
          targetPiece.isAlive
        );

      case TargetType.ENEMY:
        return !!(
          targetPiece &&
          targetPiece.team !== caster.team &&
          targetPiece.isAlive
        );

      case TargetType.EMPTY_SQUARE:
        return !targetPiece;

      case TargetType.ANY_SQUARE:
        return true;

      case TargetType.AOE:
        return true; // AOE abilities can target any square within range

      default:
        return false;
    }
  }

  /**
   * Execute an ability
   */
  static executeAbility(
    caster: Piece,
    ability: Ability,
    targetPos: Position,
    board: (Piece | null)[][]
  ): {
    success: boolean;
    board: (Piece | null)[][];
    messages: string[];
    affectedPieces: Piece[];
  } {
    const messages: string[] = [];
    const affectedPieces: Piece[] = [];
    const newBoard = board.map((row) => [...row]);

    // Validate ability usage
    const canUseCheck = this.canUseAbility(caster, ability);
    if (!canUseCheck.canUse) {
      return {
        success: false,
        board,
        messages: [canUseCheck.reason || "Cannot use ability"],
        affectedPieces: [],
      };
    }

    // Consume mana
    caster.stats.currentMana -= ability.manaCost;

    // Set cooldown
    ability.currentCooldown = ability.cooldown;

    // Execute each effect
    for (const effect of ability.effects) {
      switch (effect.type) {
        case "damage":
          this.executeDamageEffect(
            caster,
            effect,
            targetPos,
            newBoard,
            messages,
            affectedPieces
          );
          break;

        case "heal":
          this.executeHealEffect(
            caster,
            effect,
            targetPos,
            newBoard,
            messages,
            affectedPieces
          );
          break;

        case "buff":
        case "debuff":
          this.executeStatusEffect(
            caster,
            effect,
            targetPos,
            newBoard,
            messages,
            affectedPieces
          );
          break;

        case "teleport":
          this.executeTeleportEffect(
            caster,
            effect,
            targetPos,
            newBoard,
            messages,
            affectedPieces
          );
          break;
      }
    }

    messages.unshift(`${caster.type} used ${ability.name}!`);

    return {
      success: true,
      board: newBoard,
      messages,
      affectedPieces,
    };
  }

  /**
   * Execute damage effect
   */
  private static executeDamageEffect(
    caster: Piece,
    effect: any,
    targetPos: Position,
    board: (Piece | null)[][],
    messages: string[],
    affectedPieces: Piece[]
  ): void {
    const targets = effect.areaOfEffect
      ? this.getAOETargets(targetPos, effect.areaOfEffect, board)
      : [board[targetPos.y][targetPos.x]].filter(Boolean);

    for (const target of targets) {
      if (!target || target.team === caster.team) continue;

      const damage = effect.value || 0;
      const actualDamage = Math.max(1, damage - target.stats.defense);

      target.stats.currentHp = Math.max(
        0,
        target.stats.currentHp - actualDamage
      );

      if (target.stats.currentHp <= 0) {
        target.isAlive = false;
        board[target.position.y][target.position.x] = null;
        messages.push(`${target.type} was defeated!`);
      } else {
        messages.push(`${target.type} took ${actualDamage} damage!`);
      }

      affectedPieces.push(target);
    }
  }

  /**
   * Execute heal effect
   */
  private static executeHealEffect(
    caster: Piece,
    effect: any,
    targetPos: Position,
    board: (Piece | null)[][],
    messages: string[],
    affectedPieces: Piece[]
  ): void {
    const targets = effect.areaOfEffect
      ? this.getAOETargets(targetPos, effect.areaOfEffect, board)
      : [board[targetPos.y][targetPos.x]].filter(Boolean);

    for (const target of targets) {
      if (!target || target.team !== caster.team) continue;

      const healAmount = effect.value || 0;
      const oldHp = target.stats.currentHp;
      target.stats.currentHp = Math.min(
        target.stats.maxHp,
        target.stats.currentHp + healAmount
      );

      const actualHeal = target.stats.currentHp - oldHp;
      if (actualHeal > 0) {
        messages.push(`${target.type} recovered ${actualHeal} HP!`);
        affectedPieces.push(target);
      }
    }
  }

  /**
   * Execute status effect (buff/debuff)
   */
  private static executeStatusEffect(
    caster: Piece,
    effect: any,
    targetPos: Position,
    board: (Piece | null)[][],
    messages: string[],
    affectedPieces: Piece[]
  ): void {
    const targets = effect.areaOfEffect
      ? this.getAOETargets(targetPos, effect.areaOfEffect, board)
      : [board[targetPos.y][targetPos.x]].filter(Boolean);

    for (const target of targets) {
      if (!target) continue;

      // Check if target is valid based on effect type
      const isBuffForAlly =
        effect.type === "buff" && target.team === caster.team;
      const isDebuffForEnemy =
        effect.type === "debuff" && target.team !== caster.team;

      if (!isBuffForAlly && !isDebuffForEnemy) continue;

      if (effect.statusEffect) {
        // Remove existing status effect of same type if not stackable
        if (!effect.statusEffect.stackable) {
          target.statusEffects = target.statusEffects.filter(
            (se) => se.id !== effect.statusEffect.id
          );
        }

        // Add new status effect
        target.statusEffects.push({ ...effect.statusEffect });
        messages.push(
          `${target.type} is affected by ${effect.statusEffect.name}!`
        );
        affectedPieces.push(target);
      }
    }
  }

  /**
   * Execute teleport effect
   */
  private static executeTeleportEffect(
    caster: Piece,
    effect: any,
    targetPos: Position,
    board: (Piece | null)[][],
    messages: string[],
    affectedPieces: Piece[]
  ): void {
    // Clear caster's current position
    board[caster.position.y][caster.position.x] = null;

    // Move caster to target position
    caster.position = targetPos;
    board[targetPos.y][targetPos.x] = caster;

    messages.push(`${caster.type} teleported!`);
    affectedPieces.push(caster);
  }

  /**
   * Get pieces in area of effect around target position
   */
  private static getAOETargets(
    centerPos: Position,
    radius: number,
    board: (Piece | null)[][]
  ): Piece[] {
    const targets: Piece[] = [];

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const pos = { x: centerPos.x + dx, y: centerPos.y + dy };

        if (isValidPosition(pos)) {
          const piece = board[pos.y][pos.x];
          if (piece) {
            targets.push(piece);
          }
        }
      }
    }

    return targets;
  }

  /**
   * Calculate distance between two positions
   */
  private static getDistance(pos1: Position, pos2: Position): number {
    return Math.max(Math.abs(pos1.x - pos2.x), Math.abs(pos1.y - pos2.y));
  }

  /**
   * Process status effects at start of turn
   */
  static processStatusEffects(piece: Piece): string[] {
    const messages: string[] = [];

    // Process each status effect
    piece.statusEffects = piece.statusEffects.filter((effect) => {
      // Apply effect
      if (effect.onTurnStart) {
        effect.onTurnStart(piece.id);
      }

      // Handle damage over time / heal over time
      if (effect.type === StatusEffectType.DOT) {
        piece.stats.currentHp = Math.max(
          0,
          piece.stats.currentHp - effect.value
        );
        messages.push(
          `${piece.type} takes ${effect.value} damage from ${effect.name}!`
        );

        if (piece.stats.currentHp <= 0) {
          piece.isAlive = false;
          messages.push(`${piece.type} was defeated by ${effect.name}!`);
        }
      } else if (effect.type === StatusEffectType.HOT) {
        const oldHp = piece.stats.currentHp;
        piece.stats.currentHp = Math.min(
          piece.stats.maxHp,
          piece.stats.currentHp + effect.value
        );
        const healed = piece.stats.currentHp - oldHp;

        if (healed > 0) {
          messages.push(
            `${piece.type} recovers ${healed} HP from ${effect.name}!`
          );
        }
      }

      // Reduce duration
      effect.duration--;

      // Remove effect if duration expired
      if (effect.duration <= 0) {
        if (effect.onRemove) {
          effect.onRemove(piece.id);
        }
        messages.push(`${effect.name} has worn off from ${piece.type}!`);
        return false;
      }

      return true;
    });

    return messages;
  }

  /**
   * Get abilities available to a piece
   */
  static getAvailableAbilities(piece: Piece): Ability[] {
    return piece.abilities.filter((ability) => {
      const check = this.canUseAbility(piece, ability);
      return check.canUse;
    });
  }

  /**
   * Reduce cooldowns for all abilities
   */
  static reduceCooldowns(piece: Piece): void {
    piece.abilities.forEach((ability) => {
      if (ability.currentCooldown && ability.currentCooldown > 0) {
        ability.currentCooldown--;
      }
    });
  }
}
