// Equipment and item system types for Crown and Capture

export enum EquipmentSlot {
  WEAPON = "WEAPON",
  ARMOR = "ARMOR",
  ACCESSORY = "ACCESSORY",
}

export enum EquipmentRarity {
  COMMON = "COMMON",
  UNCOMMON = "UNCOMMON",
  RARE = "RARE",
  EPIC = "EPIC",
  LEGENDARY = "LEGENDARY",
}

export interface StatBonus {
  maxHp?: number;
  maxMana?: number;
  attackPower?: number;
  defense?: number;
  speed?: number;
  magicPower?: number;
  criticalChance?: number;
  criticalDamage?: number;
}

export interface Equipment {
  id: string;
  name: string;
  description: string;
  slot: EquipmentSlot;
  rarity: EquipmentRarity;
  level: number;
  statBonuses: StatBonus;
  icon: string;
  specialAbility?: string; // ID of special ability granted
  levelRequirement: number;
  pieceTypeRestriction?: string[]; // Which piece types can equip this
}

// Predefined equipment items
export const EQUIPMENT_ITEMS: Equipment[] = [
  // Weapons
  {
    id: "iron_sword",
    name: "Iron Sword",
    description: "A sturdy iron blade that increases attack power",
    slot: EquipmentSlot.WEAPON,
    rarity: EquipmentRarity.COMMON,
    level: 1,
    statBonuses: {
      attackPower: 5,
    },
    icon: "⚔️",
    levelRequirement: 1,
  },
  {
    id: "steel_sword",
    name: "Steel Sword",
    description: "A sharp steel blade with increased critical chance",
    slot: EquipmentSlot.WEAPON,
    rarity: EquipmentRarity.UNCOMMON,
    level: 3,
    statBonuses: {
      attackPower: 8,
      criticalChance: 10,
    },
    icon: "⚔️",
    levelRequirement: 3,
  },
  {
    id: "mithril_sword",
    name: "Mithril Sword",
    description: "A legendary blade forged from mithril",
    slot: EquipmentSlot.WEAPON,
    rarity: EquipmentRarity.LEGENDARY,
    level: 8,
    statBonuses: {
      attackPower: 20,
      criticalChance: 25,
      criticalDamage: 50,
    },
    icon: "⚔️",
    specialAbility: "mithril_strike",
    levelRequirement: 8,
  },
  {
    id: "holy_staff",
    name: "Holy Staff",
    description: "A blessed staff that enhances magical abilities",
    slot: EquipmentSlot.WEAPON,
    rarity: EquipmentRarity.RARE,
    level: 5,
    statBonuses: {
      magicPower: 15,
      maxMana: 20,
    },
    icon: "🔮",
    pieceTypeRestriction: ["BISHOP", "QUEEN"],
    levelRequirement: 5,
  },
  {
    id: "war_hammer",
    name: "War Hammer",
    description: "A massive hammer that crushes armor",
    slot: EquipmentSlot.WEAPON,
    rarity: EquipmentRarity.RARE,
    level: 6,
    statBonuses: {
      attackPower: 15,
      criticalDamage: 30,
    },
    icon: "🔨",
    pieceTypeRestriction: ["ROOK", "KNIGHT"],
    specialAbility: "armor_crush",
    levelRequirement: 6,
  },

  // Armor
  {
    id: "leather_armor",
    name: "Leather Armor",
    description: "Basic protection that provides moderate defense",
    slot: EquipmentSlot.ARMOR,
    rarity: EquipmentRarity.COMMON,
    level: 1,
    statBonuses: {
      defense: 3,
      maxHp: 10,
    },
    icon: "🛡️",
    levelRequirement: 1,
  },
  {
    id: "chain_mail",
    name: "Chain Mail",
    description: "Flexible armor that balances protection and mobility",
    slot: EquipmentSlot.ARMOR,
    rarity: EquipmentRarity.UNCOMMON,
    level: 3,
    statBonuses: {
      defense: 6,
      maxHp: 15,
      speed: 2,
    },
    icon: "🛡️",
    levelRequirement: 3,
  },
  {
    id: "plate_armor",
    name: "Plate Armor",
    description: "Heavy armor that provides excellent protection",
    slot: EquipmentSlot.ARMOR,
    rarity: EquipmentRarity.RARE,
    level: 5,
    statBonuses: {
      defense: 12,
      maxHp: 30,
    },
    icon: "🛡️",
    pieceTypeRestriction: ["ROOK", "KNIGHT", "KING"],
    levelRequirement: 5,
  },
  {
    id: "dragon_scale_armor",
    name: "Dragon Scale Armor",
    description: "Legendary armor crafted from ancient dragon scales",
    slot: EquipmentSlot.ARMOR,
    rarity: EquipmentRarity.LEGENDARY,
    level: 10,
    statBonuses: {
      defense: 25,
      maxHp: 50,
      magicPower: 10,
    },
    icon: "🛡️",
    specialAbility: "dragon_protection",
    levelRequirement: 10,
  },

  // Accessories
  {
    id: "health_ring",
    name: "Ring of Vitality",
    description: "A magical ring that enhances life force",
    slot: EquipmentSlot.ACCESSORY,
    rarity: EquipmentRarity.UNCOMMON,
    level: 2,
    statBonuses: {
      maxHp: 25,
    },
    icon: "💍",
    levelRequirement: 2,
  },
  {
    id: "mana_crystal",
    name: "Mana Crystal",
    description: "A crystalline pendant that stores magical energy",
    slot: EquipmentSlot.ACCESSORY,
    rarity: EquipmentRarity.UNCOMMON,
    level: 2,
    statBonuses: {
      maxMana: 30,
    },
    icon: "💎",
    levelRequirement: 2,
  },
  {
    id: "speed_boots",
    name: "Boots of Swiftness",
    description: "Enchanted boots that increase movement speed",
    slot: EquipmentSlot.ACCESSORY,
    rarity: EquipmentRarity.RARE,
    level: 4,
    statBonuses: {
      speed: 5,
    },
    icon: "👢",
    levelRequirement: 4,
  },
  {
    id: "crown_of_wisdom",
    name: "Crown of Wisdom",
    description: "A royal crown that enhances all abilities",
    slot: EquipmentSlot.ACCESSORY,
    rarity: EquipmentRarity.LEGENDARY,
    level: 12,
    statBonuses: {
      magicPower: 20,
      maxMana: 40,
      criticalChance: 15,
    },
    icon: "👑",
    pieceTypeRestriction: ["KING", "QUEEN"],
    specialAbility: "royal_blessing",
    levelRequirement: 12,
  },
];

export interface Inventory {
  equipment: Equipment[];
  maxSlots: number;
}

export interface EquippedItems {
  weapon?: Equipment;
  armor?: Equipment;
  accessory?: Equipment;
}
