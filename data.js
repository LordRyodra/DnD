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
    passivePerception: 16,
    movement: "9m",
    spellSaveDC: 16,
    spellAttackBonus: 8
  },

  assets: {
    header: "assets/archive-header-bg.png",
    portraits: {
      base_healthy: "assets/ryo-base-healthy.png",
      base_wounded: "assets/ryo-base-healthy.png",
      base_critical: "assets/ryo-base-healthy.png",
      base_collapse: "assets/ryo-base-healthy.png",
      rage_healthy: "assets/ryo-base-healthy.png",
      rage_wounded: "assets/ryo-base-healthy.png",
      rage_critical: "assets/ryo-base-healthy.png",
      rage_collapse: "assets/ryo-base-healthy.png",
      incubus1_healthy: "assets/ryo-base-healthy.png",
      incubus1_wounded: "assets/ryo-base-healthy.png",
      incubus1_critical: "assets/ryo-base-healthy.png",
      incubus2_healthy: "assets/ryo-base-healthy.png",
      incubus2_wounded: "assets/ryo-base-healthy.png",
      incubus2_critical: "assets/ryo-base-healthy.png",
      incubus3_healthy: "assets/ryo-base-healthy.png",
      incubus3_wounded: "assets/ryo-base-healthy.png",
      incubus3_critical: "assets/ryo-base-healthy.png"
    }
  },

  resources: [
    {
      id: "hp",
      name: "HP",
      label: "Hit Points",
      current: 57,
      max: 57,
      min: 0,
      type: "pool",
      priority: "very-often",
      note: "Damage state is derived from HP."
    },
    {
      id: "tempHp",
      name: "Temp HP",
      label: "Dark One's Blessing",
      current: 0,
      max: 10,
      min: 0,
      type: "pool",
      priority: "very-often",
      note: "Temporary protection. Later: demonic aura."
    },
    {
      id: "pactSlots",
      name: "Pact Slots",
      label: "Warlock Magic",
      current: 2,
      max: 2,
      min: 0,
      type: "pool",
      priority: "very-often",
      note: "Level 3 slots."
    },
    {
      id: "rage",
      name: "Rage",
      label: "Draconic Shift",
      current: 2,
      max: 2,
      min: 0,
      type: "pool",
      priority: "very-often",
      note: "Can drive the archive toward amber and red."
    },
    {
      id: "hex",
      name: "Hex",
      label: "Active Curse",
      current: 0,
      max: 1,
      min: 0,
      type: "toggle",
      priority: "very-often",
      note: "Later: target runes and purple traces."
    },
    {
      id: "exhaustion",
      name: "Exhaustion",
      label: "Body Strain",
      current: 0,
      max: 6,
      min: 0,
      type: "pool",
      priority: "sometimes",
      note: "Long-term strain marker."
    }
  ],

  attacks: [
    {
      name: "Greataxe of Ragna",
      tag: "Primary Weapon",
      attack: "+6",
      damage: "1d12 + 3 slashing",
      note: "Great Weapon Master anchor."
    },
    {
      name: "Eldritch Blast",
      tag: "Pact Attack",
      attack: "+8",
      damage: "2 × 1d10 + 5 force",
      note: "Very frequent session action."
    },
    {
      name: "Green-Flame Blade",
      tag: "Blade Cantrip",
      attack: "+6",
      damage: "1d12 + 3 slash · +1d8 fire · +1d8 + 5 jump",
      note: "Useful against clustered enemies."
    },
    {
      name: "Oni-san",
      tag: "Backup Weapon",
      attack: "+6",
      damage: "1d8 + 3 bludgeoning",
      note: "Secondary physical option."
    }
  ],

  attributes: {
    STR: 16,
    DEX: 10,
    CON: 16,
    INT: 9,
    WIS: 16,
    CHA: 20
  },

  magic: [
    { name: "Spell Save DC", value: "16" },
    { name: "Spell Attack", value: "+8" },
    { name: "Pact Slots", value: "2 / 2 · Level 3" },
    { name: "Invoker", value: "Agonizing Blast · Beast Speech · Eyes of the Rune Keeper" },
    { name: "Fiend Patron", value: "Pact chain still marked in the archive" }
  ],

  identity: [
    {
      title: "Protector",
      text: "Ryo is defined by what he chooses to protect, not by the powers layered around him."
    },
    {
      title: "Dragon Child",
      text: "The dragon represents endurance, growth, wisdom and the ancient."
    },
    {
      title: "Fiend Survivor",
      text: "The pact is a wound and a chain, not the center of who he is."
    },
    {
      title: "Incubus Heritage",
      text: "A force inherited rather than chosen. Unknown, magnetic and not fully understood."
    },
    {
      title: "Last Wall",
      text: "He seeks power because he never wants to be helpless again."
    }
  ],

  traces: [
    "Wounds leave marks.",
    "Victories leave echoes.",
    "Choices leave traces.",
    "Growth becomes visible."
  ]
};
