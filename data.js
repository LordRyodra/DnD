window.DRAGON_ARCHIVE_DATA = {
  character: {
    name: "Ryo Dragneel",
    level: 7,
    build: "Warlock 5 / Barbarian 2",
    race: "Incubus-Elf",
    theme: "Dragon Child · Fiend Survivor · Knowledge Seeker · Last Wall",
    quote: "An mir kommt ihr nicht vorbei.",
    armorClass: 16,
    proficiencyBonus: 3,
    movement: "9m",
    savingThrowProficiencies: ["WIS", "CHA"]
  },

  assets: {
    header: "assets/archive-header-bg.png",
    portraits: {
      base_healthy: "assets/ryo-base-healthy.png",
      base_lightly_wounded: "assets/ryo-base-lightly-wounded.png",
      base_wounded: "assets/ryo-base-wounded.png",
      base_critical: "assets/ryo-base-critical.png",
      base_collapse: "assets/ryo-base-collapse.png",
      rage_healthy: "assets/ryo-rage-healthy.png",
      rage_lightly_wounded: "assets/ryo-rage-healthy.png",
      rage_wounded: "assets/ryo-rage-wounded.png",
      rage_critical: "assets/ryo-rage-critical.png",
      rage_collapse: "assets/ryo-base-collapse.png",
      incubus1_healthy: "assets/ryo-incubus-stage-1.png",
      incubus1_lightly_wounded: "assets/ryo-incubus-stage-1.png",
      incubus1_wounded: "assets/ryo-incubus-stage-1.png",
      incubus1_critical: "assets/ryo-incubus-stage-1.png",
      incubus1_collapse: "assets/ryo-base-collapse.png",
      incubus2_healthy: "assets/ryo-incubus-stage-2.png",
      incubus2_lightly_wounded: "assets/ryo-incubus-stage-2.png",
      incubus2_wounded: "assets/ryo-incubus-stage-2.png",
      incubus2_critical: "assets/ryo-incubus-stage-2.png",
      incubus2_collapse: "assets/ryo-base-collapse.png",
      incubus3_healthy: "assets/ryo-incubus-stage-3.png",
      incubus3_lightly_wounded: "assets/ryo-incubus-stage-3.png",
      incubus3_wounded: "assets/ryo-incubus-stage-3.png",
      incubus3_critical: "assets/ryo-incubus-stage-3.png",
      incubus3_collapse: "assets/ryo-base-collapse.png"
    }
  },

  resources: [
    { id: "hp", name: "HP", label: "Hit Points", current: 57, max: 57, min: 0, type: "pool", priority: "very-often", note: "Damage state is derived from HP." },
    { id: "tempHp", name: "Temp HP", label: "Dark One's Blessing", current: 0, max: 30, min: 0, type: "pool", priority: "very-often", note: "Temporary demonic shield around the life thread." },
    { id: "pactSlots", name: "Pact Slots", label: "Warlock Magic", current: 2, max: 2, min: 0, type: "pool", priority: "very-often", note: "Level 3 slots." },
    { id: "rage", name: "Rage", label: "Draconic Shift", current: 2, max: 2, min: 0, type: "pool", priority: "very-often", note: "Can drive the archive toward amber and red." },
    { id: "hex", name: "Hex", label: "Active Curse", current: 0, max: 1, min: 0, type: "toggle", priority: "very-often", note: "Target curse; belongs to Pact Magic and Condition Seals." },
    { id: "concentration", name: "Concentration", label: "Spell Focus", current: 0, max: 1, min: 0, type: "toggle", priority: "sometimes", note: "Active concentration marker for spell effects." },
    { id: "exhaustion", name: "Exhaustion", label: "Body Strain", current: 0, max: 6, min: 0, type: "pool", priority: "sometimes", note: "Long-term strain marker tied to the Vital Core." }
  ],

  attacks: [
    { name: "Greataxe of Ragna", tag: "Primary Weapon", attackAbility: "STR", proficient: true, damageDie: "1d12", damageAbility: "STR", damageType: "slashing", note: "Great Weapon Master anchor." },
    { name: "Eldritch Blast", tag: "Pact Attack", attackAbility: "CHA", proficient: true, beams: 2, damageDie: "1d10", damageAbility: "CHA", damageType: "force", note: "Very frequent session action." },
    { name: "Green-Flame Blade", tag: "Blade Cantrip", attackAbility: "STR", proficient: true, damageDie: "1d12", damageAbility: "STR", damageType: "slash", extra: "+ 1d8 fire · + 1d8 CHA fire to nearby target", note: "Useful against clustered enemies." },
    { name: "Oni-san", tag: "Backup Weapon", attackAbility: "STR", proficient: true, damageDie: "1d8", damageAbility: "STR", damageType: "bludgeoning", note: "Secondary physical option." },
    { name: "Dagger", tag: "Light Weapon", attackAbility: "STR", proficient: true, damageDie: "1d4", damageAbility: "STR", damageType: "piercing", note: "Close backup option." }
  ],

  attributes: { STR: 16, DEX: 10, CON: 16, INT: 9, WIS: 16, CHA: 20 },

  skills: [
    { name: "Acrobatics", ability: "DEX" },
    { name: "Animal Handling", ability: "WIS", proficient: true },
    { name: "Arcana", ability: "INT" },
    { name: "Athletics", ability: "STR", proficient: true },
    { name: "Deception", ability: "CHA" },
    { name: "History", ability: "INT" },
    { name: "Insight", ability: "WIS" },
    { name: "Intimidation", ability: "CHA", proficient: true },
    { name: "Investigation", ability: "INT" },
    { name: "Medicine", ability: "WIS" },
    { name: "Nature", ability: "INT" },
    { name: "Perception", ability: "WIS", proficient: true },
    { name: "Performance", ability: "CHA" },
    { name: "Persuasion", ability: "CHA", proficient: true },
    { name: "Religion", ability: "INT" },
    { name: "Sleight of Hand", ability: "DEX" },
    { name: "Stealth", ability: "DEX" },
    { name: "Survival", ability: "WIS" }
  ],

  magic: [
    { name: "Spell Save DC", kind: "spellSave" },
    { name: "Spell Attack", kind: "spellAttack" },
    { name: "Pact Slots", kind: "pactSlots" },
    { name: "Invoker", value: "Agonizing Blast · Beast Speech · Eyes of the Rune Keeper" },
    { name: "Fiend Patron", value: "Pact chain still marked in the archive" }
  ],

  identity: [
    { title: "Protector", text: "Ryo is defined by what he chooses to protect, not by the powers layered around him." },
    { title: "Dragon Child", text: "The dragon represents endurance, growth, wisdom and the ancient." },
    { title: "Fiend Survivor", text: "The pact is a wound and a chain, not the center of who he is." },
    { title: "Incubus Heritage", text: "A force inherited rather than chosen. Unknown, magnetic and not fully understood." },
    { title: "Last Wall", text: "He seeks power because he never wants to be helpless again." }
  ],

  traces: [
    "Wounds leave marks.",
    "Victories leave echoes.",
    "Choices leave traces.",
    "Growth becomes visible."
  ]
};
