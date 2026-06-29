window.DRAGON_ARCHIVE_DATA = {
  character: {
    name: "Ryo Dragneel",
    level: 7,
    build: "Warlock 5 / Barbarian 2",
    race: "Incubus-Elf",
    theme: "Dragon Child · Fiend Survivor · Knowledge Seeker · Last Wall",
    quote: "An mir kommt ihr nicht vorbei.",
    armorClass: 14,
    proficiencyBonus: 3,
    warlockLevel: 5,
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
    { id: "tempHp", name: "Temp HP", label: "Dark One's Blessing", current: 0, max: 10, min: 0, type: "pool", priority: "very-often", note: "Temp HP = Warlock level + CHA modifier. Currently 10." },
    { id: "pactSlots", name: "Pact Slots", label: "Warlock Magic", current: 2, max: 2, min: 0, type: "pool", priority: "very-often", note: "Level 3 slots." },
    { id: "rage", name: "Rage", label: "Draconic Shift", current: 2, max: 2, min: 0, type: "pool", priority: "very-often", note: "Can drive the archive toward amber and red." },
    { id: "hex", name: "Hex", label: "Active Curse", current: 0, max: 1, min: 0, type: "toggle", priority: "very-often", note: "Target curse; belongs to Pact Magic and Condition Seals." },
    { id: "concentration", name: "Concentration", label: "Spell Focus", current: 0, max: 1, min: 0, type: "toggle", priority: "sometimes", note: "Active concentration marker for spell effects." },
    { id: "exhaustion", name: "Exhaustion", label: "Body Strain", current: 0, max: 6, min: 0, type: "pool", priority: "sometimes", note: "Long-term strain marker tied to the Vital Core." }
  ],

  attacks: [
    { name: "Greataxe of Ragna", tag: "Primary Weapon", icon: "⚔", mini: "Heavy melee anchor.", attackAbility: "STR", proficient: true, damageDie: "1d12", damageAbility: "STR", damageType: "slashing", note: "Great Weapon Master anchor.", detail: "Primary melee weapon. Use with Great Weapon Master when advantage or low enemy AC makes the risk worth it." },
    { name: "Eldritch Blast", tag: "Pact Attack", icon: "✦", mini: "Reliable ranged pact strike.", attackAbility: "CHA", proficient: true, beams: 2, damageDie: "1d10", damageAbility: "CHA", damageInvocation: "agonizing-blast", damageType: "force", note: "Very frequent session action.", detail: "Two beams at Warlock 5. Strong fallback when melee is unsafe or the target is hard to reach. Charisma damage is only included when Agonizing Blast is the active Invoker invocation." },
    { name: "Green-Flame Blade", tag: "Blade Cantrip", icon: "🔥", mini: "Melee hit with jumping fire.", attackAbility: "STR", proficient: true, damageDie: "1d12", damageAbility: "STR", damageType: "slash", extra: "+ 1d8 fire · + 1d8 CHA fire to nearby target", note: "Useful against clustered enemies.", detail: "Best when a second creature stands within 5 feet of the main target. Uses a weapon attack, then fire leaps to a nearby enemy." },
    { name: "Oni-san", tag: "Backup Weapon", icon: "◆", mini: "Physical backup option.", attackAbility: "STR", proficient: true, damageDie: "1d8", damageAbility: "STR", damageType: "bludgeoning", note: "Secondary physical option.", detail: "Fallback melee option when the greataxe is unavailable or inappropriate." },
    { name: "Dagger", tag: "Light Weapon", icon: "†", mini: "Small close backup.", attackAbility: "STR", proficient: true, damageDie: "1d4", damageAbility: "STR", damageType: "piercing", note: "Close backup option.", detail: "Light emergency weapon. Not the main plan, but useful when disarmed or constrained." }
  ],

  attributes: { STR: 16, DEX: 10, CON: 16, INT: 9, WIS: 16, CHA: 20 },

  skills: [
    { name: "Acrobatics", ability: "DEX" },
    { name: "Animal Handling", ability: "WIS", proficient: true },
    { name: "Arcana", ability: "INT" },
    { name: "Athletics", ability: "STR" },
    { name: "Deception", ability: "CHA" },
    { name: "History", ability: "INT" },
    { name: "Insight", ability: "WIS" },
    { name: "Intimidation", ability: "CHA", proficient: true },
    { name: "Investigation", ability: "INT" },
    { name: "Medicine", ability: "WIS" },
    { name: "Nature", ability: "INT", proficient: true },
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
    { name: "Pact Slots", kind: "pactSlots" }
  ],

  magicCategories: [
    { id: "warlock-spells", title: "Warlock Spells", subtitle: "Pact magic and leveled spells. Prepared cards stay bright; planned or inactive cards are muted." },
    { id: "cantrips", title: "Cantrips", subtitle: "At-will magic and blade cantrips." },
    { id: "invocations", title: "Eldritch Invocations", subtitle: "Always-active sigils are permanent. The Invoker Pool has three options, but only one can be active at once." },
    { id: "incubus-magic", title: "Incubus Magic", subtitle: "Heritage abilities. Active ones glow; dormant ones stay sealed." }
  ],

  magicCards: [
    { id: "fireball", category: "warlock-spells", name: "Fireball", tag: "3rd Level", icon: "✹", mini: "Explosive area damage.", kind: "spellSave", type: "Spell", cost: "1 Pact Slot", range: "150 ft", duration: "Instantaneous", prepared: true, detail: "A bright streak detonates into a 20-foot-radius explosion. Creatures in the area make a Dexterity saving throw against Ryo's spell save DC." },
    { id: "counterspell", category: "warlock-spells", name: "Counterspell", tag: "3rd Level", icon: "◇", mini: "Interrupt enemy magic.", type: "Reaction Spell", cost: "1 Pact Slot", range: "60 ft", duration: "Instantaneous", prepared: false, detail: "Use as a reaction when a creature casts a spell. Counters 3rd-level spells automatically; higher spells may require a Charisma ability check depending on the spell level." },
    { id: "hex", category: "warlock-spells", name: "Hex", tag: "1st Level", icon: "☾", mini: "Curse and pressure mark.", type: "Concentration Spell", cost: "1 Pact Slot", range: "90 ft", duration: "Concentration", prepared: true, detail: "Marks a creature with a curse. Ryo deals extra necrotic damage when he hits the target and can choose one ability for disadvantage on ability checks." },
    { id: "witch-bolt", category: "warlock-spells", name: "Witch Bolt", tag: "1st Level", icon: "↯", mini: "Sustained lightning tether.", kind: "spellAttack", type: "Concentration Spell", cost: "1 Pact Slot", range: "30 ft", duration: "Concentration", prepared: true, detail: "Ranged spell attack. On hit, lightning damage connects through a sustained arc while concentration and range are maintained." },
    { id: "hold-person", category: "warlock-spells", name: "Hold Person", tag: "2nd Level", icon: "⛓", mini: "Paralyze a humanoid.", kind: "spellSave", type: "Concentration Spell", cost: "1 Pact Slot", range: "60 ft", duration: "Concentration", prepared: true, detail: "A humanoid makes a Wisdom saving throw against Ryo's spell save DC. On failure, it is paralyzed while the spell holds." },
    { id: "misty-step", category: "warlock-spells", name: "Misty Step", tag: "2nd Level", icon: "☁", mini: "Bonus-action teleport.", type: "Spell", cost: "1 Pact Slot", range: "Self", duration: "Instantaneous", prepared: true, detail: "Briefly surrounded by silvery mist, Ryo teleports up to 30 feet to an unoccupied space he can see." },

    { id: "eldritch-blast", category: "cantrips", name: "Eldritch Blast", tag: "Cantrip", icon: "✦", mini: "Pact force attack.", kind: "spellAttack", type: "Cantrip", cost: "At Will", range: "120 ft", duration: "Instantaneous", prepared: true, detail: "Two force beams at Warlock 5. Each beam uses Ryo's spell attack bonus. With Agonizing Blast active, Charisma is added to the damage." },
    { id: "green-flame-blade", category: "cantrips", name: "Green-Flame Blade", tag: "Cantrip", icon: "🔥", mini: "Weapon strike with fire jump.", type: "Blade Cantrip", cost: "At Will", range: "Self / 5 ft", duration: "Instantaneous", prepared: true, detail: "Make a melee weapon attack. On hit, the target takes the weapon damage and fire can leap to a nearby creature." },
    { id: "prestidigitation", category: "cantrips", name: "Prestidigitation", tag: "Cantrip", icon: "✧", mini: "Minor magical effects.", type: "Cantrip", cost: "At Will", range: "10 ft", duration: "Up to 1 hour", prepared: true, detail: "Small harmless sensory or utility effects: sparks, cleaning, flavoring, marks, tiny illusions and similar minor tricks." },
    { id: "distort-value", category: "cantrips", name: "Distort Value", tag: "Cantrip", icon: "◈", mini: "Make objects seem worth more or less.", type: "Cantrip", cost: "At Will", range: "Touch", duration: "8 hours", prepared: true, detail: "Makes an object appear more valuable or less valuable to mundane appraisal. Useful for deception, trade pressure or misdirection." },

    { id: "mask-many-faces", category: "invocations", name: "Mask of Many Faces", tag: "Always Active", icon: "◑", mini: "At-will disguise layer.", type: "Eldritch Invocation", cost: "At Will", range: "Self", duration: "1 hour", prepared: true, alwaysActive: true, invocationType: "always", detail: "Allows Ryo to cast Disguise Self without expending a spell slot." },
    { id: "heart-of-the-pact", category: "invocations", name: "Heart of the Pact", tag: "Always Active", icon: "✧", mini: "Pact of the Blade layer.", type: "Homebrew Invocation", cost: "Passive", range: "Self", duration: "Persistent", prepared: true, alwaysActive: true, invocationType: "always", detail: "Current Heart of the Pact configuration copies Pact of the Blade rather than Pact of the Tome. This enables Ryo's blade-pact invocation layer." },
    { id: "eldritch-armor", category: "invocations", name: "Eldritch Armor", tag: "Always Active", icon: "▣", mini: "Armor invocation layer.", type: "Eldritch Invocation", cost: "Passive", range: "Self", duration: "Persistent", prepared: true, alwaysActive: true, invocationType: "always", detail: "Armor invocation currently available through the Pact of the Blade layer. Use this card for armor proficiency/equipment notes as the table finalizes the exact wording." },
    { id: "agonizing-blast", category: "invocations", name: "Agonizing Blast", tag: "Invoker Pool", icon: "✦", mini: "CHA to Eldritch Blast damage.", type: "Invoker Invocation", cost: "Active Invoker Slot", range: "Self", duration: "Until switched", prepared: true, invokerPool: true, invocationType: "invoker", detail: "When active, add Charisma modifier to each Eldritch Blast beam's damage. Only one Invoker Pool card can be active at a time." },
    { id: "beast-speech", category: "invocations", name: "Beast Speech", tag: "Invoker Pool", icon: "♧", mini: "Speak with animals at will.", type: "Invoker Invocation", cost: "Active Invoker Slot", range: "Self", duration: "Until switched", prepared: true, invokerPool: true, invocationType: "invoker", detail: "When active, Ryo can cast Speak with Animals at will without expending a spell slot. Only one Invoker Pool card can be active at a time." },
    { id: "eyes-rune-keeper", category: "invocations", name: "Eyes of the Rune Keeper", tag: "Invoker Pool", icon: "☷", mini: "Read all writing.", type: "Invoker Invocation", cost: "Active Invoker Slot", range: "Self", duration: "Until switched", prepared: true, invokerPool: true, invocationType: "invoker", detail: "When active, Ryo can read all writing. Useful for ancient scripts, ruins and archive work. Only one Invoker Pool card can be active at a time." },

    { id: "incubus-statistics", category: "incubus-magic", name: "Statistics", tag: "Active Heritage", icon: "◆", mini: "Active incubus ability.", type: "Incubus Magic", cost: "Heritage", range: "Self", duration: "State-based", prepared: true, detail: "Currently active incubus magic. Exact rules can be edited once the table details are finalized." },
    { id: "incubus-triggered", category: "incubus-magic", name: "Triggered", tag: "Active Heritage", icon: "◆", mini: "Active incubus trigger.", type: "Incubus Magic", cost: "Heritage", range: "Self", duration: "Triggered", prepared: true, detail: "Currently active incubus magic. Exact rules can be edited once the table details are finalized." },
    { id: "incubus-task", category: "incubus-magic", name: "Task", tag: "Active Heritage", icon: "◆", mini: "Active incubus task layer.", type: "Incubus Magic", cost: "Heritage", range: "Self", duration: "State-based", prepared: true, detail: "Currently active incubus magic. Exact rules can be edited once the table details are finalized." },
    { id: "incubus-command", category: "incubus-magic", name: "Command", tag: "Active Heritage", icon: "◆", mini: "Active command instinct.", type: "Incubus Magic", cost: "Heritage", range: "Self / Aura", duration: "State-based", prepared: true, detail: "Currently active incubus magic. Exact rules can be edited once the table details are finalized." },
    { id: "incubus-mantraction", category: "incubus-magic", name: "Mantraction", tag: "Dormant Heritage", icon: "◇", mini: "Dormant incubus ability.", type: "Incubus Magic", cost: "Unknown", range: "Unknown", duration: "Unknown", prepared: false, detail: "Dormant incubus magic. Keep grey until unlocked, understood or prepared." },
    { id: "incubus-glow", category: "incubus-magic", name: "Glow", tag: "Dormant Heritage", icon: "◇", mini: "Dormant incubus ability.", type: "Incubus Magic", cost: "Unknown", range: "Unknown", duration: "Unknown", prepared: false, detail: "Dormant incubus magic. Keep grey until unlocked, understood or prepared." },
    { id: "incubus-sensitivity", category: "incubus-magic", name: "Sensitivity", tag: "Dormant Heritage", icon: "◇", mini: "Dormant sensory instinct.", type: "Incubus Magic", cost: "Unknown", range: "Unknown", duration: "Unknown", prepared: false, detail: "Dormant incubus magic. Keep grey until unlocked, understood or prepared." },
    { id: "incubus-animalistic", category: "incubus-magic", name: "Animalistic", tag: "Dormant Heritage", icon: "◇", mini: "Dormant instinct layer.", type: "Incubus Magic", cost: "Unknown", range: "Unknown", duration: "Unknown", prepared: false, detail: "Dormant incubus magic. Keep grey until unlocked, understood or prepared." },
    { id: "incubus-siphoning", category: "incubus-magic", name: "Siphoning", tag: "Dormant Heritage", icon: "◇", mini: "Dormant life-energy pull.", type: "Incubus Magic", cost: "Unknown", range: "Unknown", duration: "Unknown", prepared: false, detail: "Dormant incubus magic. Keep grey until unlocked, understood or prepared." },
    { id: "incubus-receptacle", category: "incubus-magic", name: "Receptacle", tag: "Dormant Heritage", icon: "◇", mini: "Dormant vessel layer.", type: "Incubus Magic", cost: "Unknown", range: "Unknown", duration: "Unknown", prepared: false, detail: "Dormant incubus magic. Keep grey until unlocked, understood or prepared." },
    { id: "incubus-violove", category: "incubus-magic", name: "Violove", tag: "Dormant Heritage", icon: "◇", mini: "Dormant heritage ability.", type: "Incubus Magic", cost: "Unknown", range: "Unknown", duration: "Unknown", prepared: false, detail: "Dormant incubus magic. Keep grey until unlocked, understood or prepared." },
    { id: "incubus-deep-focus", category: "incubus-magic", name: "Deep Focus", tag: "Dormant Heritage", icon: "◇", mini: "Dormant focus instinct.", type: "Incubus Magic", cost: "Unknown", range: "Unknown", duration: "Unknown", prepared: false, detail: "Dormant incubus magic. Keep grey until unlocked, understood or prepared." },
    { id: "incubus-vibrancy", category: "incubus-magic", name: "Vibrancy", tag: "Dormant Heritage", icon: "◇", mini: "Dormant vitality layer.", type: "Incubus Magic", cost: "Unknown", range: "Unknown", duration: "Unknown", prepared: false, detail: "Dormant incubus magic. Keep grey until unlocked, understood or prepared." },
    { id: "incubus-messaging", category: "incubus-magic", name: "Messaging", tag: "Dormant Heritage", icon: "◇", mini: "Dormant contact layer.", type: "Incubus Magic", cost: "Unknown", range: "Unknown", duration: "Unknown", prepared: false, detail: "Dormant incubus magic. Keep grey until unlocked, understood or prepared." },
    { id: "incubus-libido", category: "incubus-magic", name: "Libido", tag: "Dormant Heritage", icon: "◇", mini: "Dormant instinct pressure.", type: "Incubus Magic", cost: "Unknown", range: "Unknown", duration: "Unknown", prepared: false, detail: "Dormant incubus magic. Keep grey until unlocked, understood or prepared." },
    { id: "incubus-destruction", category: "incubus-magic", name: "Destruction", tag: "Dormant Heritage", icon: "◇", mini: "Dormant destructive layer.", type: "Incubus Magic", cost: "Unknown", range: "Unknown", duration: "Unknown", prepared: false, detail: "Dormant incubus magic. Keep grey until unlocked, understood or prepared." }
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
