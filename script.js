const DATA = window.DRAGON_ARCHIVE_DATA;
const STORAGE_KEY = "dragonArchive.v1.ryo.currentState";

const DEFAULT_STATE = {
  activeTab: "status",
  form: "base",
  inspiration: false,
  notes: "",
  deathSaves: { successes: 0, failures: 0 },
  proficiencyBonus: DATA.character.proficiencyBonus,
  attributes: { ...DATA.attributes },
  activeInvokerInvocation: "agonizing-blast",
  cardAvailability: {},
  cardOverrides: { combat: {}, magic: {} },
  resources: Object.fromEntries(DATA.resources.map((resource) => [resource.id, resource.current]))
};

let state = loadState();
let currentPortraitPath = null;
let portraitSwapToken = 0;

function clone(value) {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored) return clone(DEFAULT_STATE);
    return {
      ...clone(DEFAULT_STATE),
      ...stored,
      deathSaves: {
        ...DEFAULT_STATE.deathSaves,
        ...(stored.deathSaves || {})
      },
      proficiencyBonus: stored.proficiencyBonus ?? DEFAULT_STATE.proficiencyBonus,
      attributes: {
        ...DEFAULT_STATE.attributes,
        ...(stored.attributes || {})
      },
      activeInvokerInvocation: stored.activeInvokerInvocation || DEFAULT_STATE.activeInvokerInvocation,
      cardAvailability: {
        ...DEFAULT_STATE.cardAvailability,
        ...(stored.cardAvailability || {})
      },
      cardOverrides: {
        combat: { ...(stored.cardOverrides?.combat || {}) },
        magic: { ...(stored.cardOverrides?.magic || {}) }
      },
      resources: {
        ...DEFAULT_STATE.resources,
        ...(stored.resources || {})
      }
    };
  } catch (error) {
    console.warn("Dragon Archive state could not be loaded.", error);
    return clone(DEFAULT_STATE);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clamp(value, min, max) {
  return Math.min(Math.max(Number(value), min), max);
}

function hpPercent() {
  const hp = getResourceValue("hp");
  const hpMax = getResource("hp")?.max || 1;
  return clamp(Math.round((hp / hpMax) * 100), 0, 100);
}

function hpColor(percent = hpPercent()) {
  const pct = clamp(percent, 0, 100);
  if (pct >= 50) {
    const local = (pct - 50) / 50;
    const hue = 48 + local * 96;
    return `hsl(${hue} 92% 54%)`;
  }
  const local = pct / 50;
  const hue = local * 48;
  const light = 42 + local * 12;
  return `hsl(${hue} 86% ${light}%)`;
}

function applyHpColorVars() {
  const percent = hpPercent();
  const color = hpColor(percent);
  document.body.style.setProperty("--hp-color", color);
  document.body.style.setProperty("--hp-fill", `${percent}%`);
}

function deathSaveLiveProbability(successes, failures) {
  const s = clamp(successes, 0, 3);
  const f = clamp(failures, 0, 3);
  const memo = new Map();

  function walk(sv, fl) {
    if (sv >= 3) return 1;
    if (fl >= 3) return 0;
    const key = `${sv}/${fl}`;
    if (memo.has(key)) return memo.get(key);
    const value = 0.5 * walk(sv + 1, fl) + 0.5 * walk(sv, fl + 1);
    memo.set(key, value);
    return value;
  }

  return walk(s, f);
}

function getResource(id) {
  return DATA.resources.find((resource) => resource.id === id);
}

function getResourceValue(id) {
  const resource = getResource(id);
  if (!resource) return 0;
  return clamp(state.resources[id] ?? resource.current, resource.min, resource.max);
}

function setResourceValue(id, value) {
  const resource = getResource(id);
  if (!resource) return;
  state.resources[id] = clamp(value, resource.min, resource.max);
  saveState();
  render();
}

function getDamageState() {
  const hp = getResourceValue("hp");
  const maxHp = getResource("hp").max;
  if (hp <= 0) return "collapse";
  const ratio = hp / maxHp;
  if (ratio <= 0.15) return "critical";
  if (ratio <= 0.50) return "wounded";
  if (ratio <= 0.75) return "lightly_wounded";
  return "healthy";
}

function getControlLabel() {
  if (state.form === "incubus3") return "Instinctive";
  if (state.form === "incubus2") return "Unstable";
  if (state.form === "incubus1") return "Stirring";
  if (state.form === "rage") return "Pressurized";
  return "Stable";
}

function getFormLabel(form = state.form) {
  const labels = {
    base: "Base Form",
    rage: "Rage / Draconic Shift",
    incubus1: "Incubus Emergence I",
    incubus2: "Incubus Emergence II",
    incubus3: "Incubus Emergence III"
  };
  return labels[form] || labels.base;
}

function getDamageLabel(damage = getDamageState()) {
  const labels = {
    healthy: "Healthy",
    lightly_wounded: "Lightly Wounded",
    wounded: "Wounded",
    critical: "Critical",
    collapse: "Collapse"
  };
  return labels[damage] || labels.healthy;
}

function getManifestationNote() {
  const damage = getDamageState();
  if (damage === "collapse") return "The archive light is almost extinguished.";
  if (state.form === "rage" && damage === "critical") return "Almost broken, but the dragon refuses to let him fall.";
  if (state.form === "rage") return "The wall becomes hot enough to burn anything that tries to pass.";
  if (state.form === "incubus3") return "The inherited instinct is no longer only beneath the surface.";
  if (state.form === "incubus2") return "The old instinct answers more clearly, still unfamiliar.";
  if (state.form === "incubus1") return "Something magnetic and unknown begins to stir.";
  if (damage === "critical") return "Close to collapse, still refusing to fall.";
  if (damage === "wounded") return "The archive records blood, strain and endurance.";
  if (damage === "lightly_wounded") return "The archive notes fresh strain, but Ryo remains controlled.";
  return "Silent guardian. Controlled presence.";
}

function getPortraitPath() {
  const damage = getDamageState();
  if (damage === "collapse") return DATA.assets.portraits.base_collapse || DATA.assets.portraits.base_healthy;
  const key = `${state.form}_${damage}`;
  return DATA.assets.portraits[key] || DATA.assets.portraits[`base_${damage}`] || DATA.assets.portraits.base_healthy;
}

function getIncubusStage() {
  if (state.form === "incubus1") return 1;
  if (state.form === "incubus2") return 2;
  if (state.form === "incubus3") return 3;
  return 0;
}

function normalizeState() {
  const damage = getDamageState();
  if (damage === "collapse" && state.form === "rage") {
    state.form = "base";
    return true;
  }
  return false;
}

function setText(selector, text) {
  const element = document.querySelector(selector);
  if (element) element.textContent = text;
}

function flashButton(button) {
  if (!button) return;
  button.classList.remove("is-warning");
  requestAnimationFrame(() => {
    button.classList.add("is-warning");
    setTimeout(() => button.classList.remove("is-warning"), 320);
  });
}

function activateBaseForm() {
  state.form = "base";
  saveState();
  render();
}

function activateRageForm(button) {
  const rage = getResourceValue("rage");
  if (state.form !== "rage") {
    if (rage <= 0) {
      flashButton(button || document.querySelector("#rageButton"));
      return;
    }
    state.resources.rage = rage - 1;
  }
  state.form = "rage";
  saveState();
  render();
}

function advanceIncubusForm() {
  if (state.form === "incubus1") state.form = "incubus2";
  else if (state.form === "incubus2") state.form = "incubus3";
  else state.form = "incubus1";
  saveState();
  render();
}

function renderHero() {
  const heroRings = document.querySelector("#heroRings");
  if (!heroRings) return;

  const hp = getResourceValue("hp");
  const hpMax = getResource("hp").max;
  const percent = hpPercent();
  const color = hpColor(percent);

  heroRings.innerHTML = `
    <button class="resource-ring hp-header-ring is-clickable" type="button" data-focus-resource="hp" style="--ring-fill: ${percent}%; --ring-color: ${color};" aria-label="HP ${hp} of ${hpMax}">
      <span class="resource-label">HP</span>
      <strong>${hp}</strong>
      <small>/${hpMax}</small>
    </button>
    <div class="hero-stat-plaque" aria-label="Armor Class ${DATA.character.armorClass}">
      <span>AC</span>
      <strong>${DATA.character.armorClass}</strong>
      <small>Armor Class</small>
    </div>
    <div class="hero-stat-plaque" aria-label="Initiative ${formatModifier(getInitiativeBonus())}">
      <span>INIT</span>
      <strong>${formatModifier(getInitiativeBonus())}</strong>
      <small>Initiative</small>
    </div>
    <div class="hero-stat-plaque" aria-label="Speed ${DATA.character.movement}">
      <span>SPD</span>
      <strong>${DATA.character.movement}</strong>
      <small>Movement</small>
    </div>
    <div class="hero-stat-plaque" aria-label="Proficiency Bonus +${getProficiencyBonus()}">
      <span>PB</span>
      <strong>+${getProficiencyBonus()}</strong>
      <small>Proficiency</small>
    </div>
  `;
}

function renderVitalCore() {
  const hp = getResourceValue("hp");
  const hpMax = getResource("hp").max;
  const tempHp = getResourceValue("tempHp");
  const percent = hpPercent();
  const color = hpColor(percent);

  applyHpColorVars();
  setText("#largeHpValue", hp);
  setText("#largeHpMax", `/${hpMax}`);
  setText("#tempHpValue", tempHp);

  const hpRing = document.querySelector("#largeHpRing");
  if (hpRing) {
    hpRing.style.setProperty("--hp-fill", `${percent}%`);
    hpRing.style.setProperty("--hp-color", color);
  }

  const damage = getDamageState();
  const flavor = {
    healthy: "HP is steady. The life thread burns green and controlled.",
    lightly_wounded: "The life thread starts to dim toward gold. Minor wounds are visible.",
    wounded: "The life thread has shifted into deeper gold and amber. The archive records strain.",
    critical: "Deep red pressure. Ryo is close to collapse, but still standing.",
    collapse: "The archive light is nearly extinguished. Death saves decide the gate."
  };
  setText("#hpFlavor", flavor[damage]);
}

function renderDeathGate() {
  const saves = state.deathSaves || { successes: 0, failures: 0 };
  saves.successes = clamp(saves.successes || 0, 0, 3);
  saves.failures = clamp(saves.failures || 0, 0, 3);
  state.deathSaves = saves;

  const liveProbability = deathSaveLiveProbability(saves.successes, saves.failures);
  const pointerPercent = clamp((1 - liveProbability) * 100, 0, 100);
  const pointer = document.querySelector("#deathPointer");
  if (pointer) pointer.style.left = `${pointerPercent}%`;

  const successDots = document.querySelector("#deathSuccessDots");
  if (successDots) {
    successDots.innerHTML = Array.from({ length: 3 }, (_, i) => `
      <button type="button" class="${i < saves.successes ? "is-filled" : ""}" data-set-death="success" data-value="${i + 1}" aria-label="Set death save successes to ${i + 1}">✓</button>
    `).join("");
  }

  const failureDots = document.querySelector("#deathFailureDots");
  if (failureDots) {
    failureDots.innerHTML = Array.from({ length: 3 }, (_, i) => `
      <button type="button" class="${i < saves.failures ? "is-filled" : ""}" data-set-death="failure" data-value="${i + 1}" aria-label="Set death save failures to ${i + 1}">×</button>
    `).join("");
  }

  let text = "Balanced between life and death. Success pulls left, failure pulls right.";
  if (saves.successes >= 3) text = "Stable. The gate opens back toward life.";
  else if (saves.failures >= 3) text = "Death has crossed the threshold.";
  else if (saves.successes || saves.failures) {
    text = `${saves.successes} success / ${saves.failures} failure. Current pull toward life: ${Math.round(liveProbability * 100)}%.`;
  }
  setText("#deathGateText", text);
}

function renderResources() {
  const container = document.querySelector("#resourceCards");
  if (!container) return;

  container.innerHTML = DATA.resources.map((resource) => {
    const value = getResourceValue(resource.id);
    const percent = resource.max ? Math.round((value / resource.max) * 100) : 0;
    const isToggle = resource.type === "toggle";
    const display = isToggle ? (value ? "Active" : "Dormant") : `${value} / ${resource.max}`;
    const bar = isToggle ? (value ? 100 : 0) : percent;

    return `
      <article class="resource-card" data-resource-card="${resource.id}">
        <div class="resource-card-top">
          <div>
            <span>${resource.label}</span>
            <h3>${resource.name}</h3>
          </div>
          <strong>${display}</strong>
        </div>
        <div class="resource-bar" aria-hidden="true"><span style="width: ${clamp(bar, 0, 100)}%"></span></div>
        <p>${resource.note}</p>
        <div class="resource-controls">
          ${isToggle ? `
            <button type="button" data-toggle-resource="${resource.id}">${value ? "Deactivate" : "Activate"}</button>
          ` : `
            <button type="button" data-adjust-resource="${resource.id}" data-step="-1">−</button>
            <button type="button" data-adjust-resource="${resource.id}" data-step="1">+</button>
          `}
        </div>
      </article>
    `;
  }).join("");
}

function safeText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slugify(value) {
  return String(value || "card")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "card";
}

function cardId(card, index, group = "magic") {
  return card.id || `${group}-${slugify(card.name)}-${index}`;
}

function getCardOverrides(group, id) {
  return state.cardOverrides?.[group]?.[id] || {};
}

function mergedCard(card, group, index) {
  const id = cardId(card, index, group);
  return { ...card, ...getCardOverrides(group, id), id };
}

function isCardPrepared(card) {
  if (card.alwaysActive) return true;
  if (card.invokerPool) return state.activeInvokerInvocation === card.id;
  if (Object.prototype.hasOwnProperty.call(state.cardAvailability || {}, card.id)) {
    return Boolean(state.cardAvailability[card.id]);
  }
  return card.prepared !== false;
}

function cardStatusLabel(card) {
  if (card.alwaysActive) return "Always Active";
  if (card.invokerPool) return state.activeInvokerInvocation === card.id ? "Invoker Active" : "Invoker Inactive";
  return isCardPrepared(card) ? "Prepared" : "Dormant";
}

function cardTone(card, fallback = "archive") {
  if (card.tone) return card.tone;
  if (card.category === "incubus-magic" || card.type?.toLowerCase().includes("incubus")) return "incubus";
  if (card.category === "invocations" || card.type?.toLowerCase().includes("invocation")) return "pact";
  if (card.category === "warlock-spells") return "magic";
  if (card.category === "cantrips") return "cantrip";
  return fallback;
}

function dynamicCardValue(card) {
  if (card.kind === "spellSave") return getSpellSaveDC();
  if (card.kind === "spellAttack") return formatModifier(getSpellAttackBonus());
  if (card.kind === "pactSlots") return `${getResourceValue("pactSlots")} / ${getResource("pactSlots").max} · Level 3`;
  return card.dynamic || "Ryo Layer";
}

function cardEditFields(card) {
  const fields = [
    ["icon", "Icon"],
    ["tag", "Tag"],
    ["name", "Name"],
    ["mini", "Front text"],
    ["type", "Type"],
    ["cost", "Cost"],
    ["range", "Range"],
    ["duration", "Duration"]
  ];
  const inputFields = fields.map(([key, label]) => `
    <label><span>${safeText(label)}</span><input data-card-edit-field="${safeText(key)}" value="${safeText(card[key] || "")}" /></label>
  `).join("");
  return `
    <div class="card-edit-area" data-card-edit-area>
      <div class="card-edit-grid">${inputFields}</div>
      <label class="card-edit-detail"><span>Details</span><textarea data-card-edit-field="detail">${safeText(card.detail || "")}</textarea></label>
      <div class="card-edit-actions">
        <button type="button" data-save-card-edit>Save Card</button>
        <button type="button" data-reset-card-edit>Reset Text</button>
      </div>
    </div>
  `;
}

function flipCardTemplate({ index, group, card, tag, name, icon, mini, tone, details }) {
  const sourceCard = card || { tag, name, icon, mini, tone };
  const safeGroup = safeText(group || "archive");
  const id = cardId(sourceCard, index, group);
  const prepared = isCardPrepared(sourceCard);
  const safeTone = safeText(cardTone(sourceCard, tone || "archive"));
  const statusLabel = cardStatusLabel(sourceCard);
  const classes = [
    "archive-flip-card",
    `card-tone-${safeTone}`,
    prepared ? "is-prepared" : "is-muted",
    sourceCard.invokerPool ? "is-invoker-pool" : "",
    sourceCard.invokerPool && state.activeInvokerInvocation === id ? "is-invoker-active" : "",
    sourceCard.alwaysActive ? "is-always-active" : ""
  ].filter(Boolean).join(" ");

  const detailRows = (details || []).map(([label, value]) => `
    <div class="flip-detail-row">
      <span>${safeText(label)}</span>
      <strong>${safeText(value)}</strong>
    </div>
  `).join("");

  const availabilityButton = sourceCard.invokerPool
    ? `<button type="button" class="card-state-button" data-set-invoker="${safeText(id)}">${state.activeInvokerInvocation === id ? "Active Invoker" : "Set Active"}</button>`
    : sourceCard.alwaysActive
      ? `<span class="card-state-pill">Always Active</span>`
      : `<button type="button" class="card-state-button" data-toggle-card-availability data-card-group="${safeGroup}" data-card-id="${safeText(id)}">${prepared ? "Prepared" : "Mark Prepared"}</button>`;

  return `
    <article class="${classes}" data-flip-card tabindex="0" role="button" aria-label="Open ${safeText(sourceCard.name)} card" data-card-group="${safeGroup}" data-card-index="${index}" data-card-id="${safeText(id)}">
      <div class="archive-flip-inner">
        <section class="archive-card-face archive-card-front">
          <div class="archive-card-art" aria-hidden="true"><span>${safeText(sourceCard.icon || "✦")}</span></div>
          <div class="archive-card-front-copy">
            <small>${safeText(sourceCard.tag || "Archive Card")}</small>
            <h3>${safeText(sourceCard.name)}</h3>
            <p>${safeText(sourceCard.mini || "Click to reveal details.")}</p>
          </div>
          <span class="card-status-badge">${safeText(statusLabel)}</span>
        </section>
        <section class="archive-card-face archive-card-back">
          <button class="card-close" type="button" data-close-card aria-label="Close card">×</button>
          <div class="card-back-header">
            <small>${safeText(sourceCard.tag || "Archive Card")}</small>
            <h3>${safeText(sourceCard.name)}</h3>
            <span>${safeText(statusLabel)}</span>
          </div>
          <div class="flip-detail-stack">${detailRows}</div>
          <div class="card-back-actions">
            ${availabilityButton}
            <button type="button" class="card-edit-button" data-edit-card> Edit</button>
          </div>
          ${cardEditFields(sourceCard)}
        </section>
      </div>
    </article>
  `;
}

function closeExpandedCards() {
  document.querySelectorAll("[data-flip-card].is-expanded").forEach((card) => card.classList.remove("is-expanded"));
  document.body.classList.remove("card-overlay-active");
}

function openFlipCard(card) {
  if (!card) return;
  document.querySelectorAll("[data-flip-card].is-expanded").forEach((openCard) => {
    if (openCard !== card) openCard.classList.remove("is-expanded");
  });
  card.classList.add("is-expanded");
  document.body.classList.add("card-overlay-active");
}

function renderActions(targetId) {
  const container = document.querySelector(targetId);
  if (!container) return;
  container.classList.add("archive-card-grid", "combat-card-grid");
  container.innerHTML = DATA.attacks.map((attack, index) => {
    const card = mergedCard(attack, "combat", index);
    const toHit = formatModifier(getAttackBonus(attack));
    const damage = getAttackDamage(attack);
    const details = [
      ["To Hit", toHit],
      ["Damage", damage],
      ["Ability", `${attack.attackAbility || "STR"}${attack.proficient ? " · prof" : ""}`],
      ["Use", card.detail || attack.detail || attack.note || "Combat option."]
    ];
    return flipCardTemplate({
      index,
      group: "combat",
      card: { ...card, prepared: true, tone: "weapon" },
      details
    });
  }).join("");
}

function formatModifier(value) {
  return value >= 0 ? `+${value}` : `${value}`;
}

function abilityModifier(score) {
  return Math.floor((score - 10) / 2);
}

function currentAttributes() {
  return state.attributes || DATA.attributes;
}

function getAttributeScore(ability) {
  return currentAttributes()[ability] ?? DATA.attributes[ability] ?? 10;
}

function getAbilityMod(ability) {
  return abilityModifier(getAttributeScore(ability));
}

function getProficiencyBonus() {
  return Number(state.proficiencyBonus ?? DATA.character.proficiencyBonus ?? 0);
}

function getSkillBonus(skill) {
  return getAbilityMod(skill.ability) + (skill.proficient ? getProficiencyBonus() : 0) + (skill.bonusAdjustment || 0);
}

function getSaveBonus(ability) {
  const proficiencies = new Set(DATA.character.savingThrowProficiencies || []);
  return getAbilityMod(ability) + (proficiencies.has(ability) ? getProficiencyBonus() : 0);
}

function getInitiativeBonus() {
  return getAbilityMod("DEX");
}

function getPassivePerception() {
  const perception = (DATA.skills || []).find((skill) => skill.name === "Perception") || { ability: "WIS" };
  return 10 + getSkillBonus(perception);
}

function getSpellSaveDC() {
  return 8 + getProficiencyBonus() + getAbilityMod("CHA");
}

function getSpellAttackBonus() {
  return getProficiencyBonus() + getAbilityMod("CHA");
}

function getAttackBonus(attack) {
  return getAbilityMod(attack.attackAbility || "STR") + (attack.proficient ? getProficiencyBonus() : 0) + (attack.attackAdjustment || 0);
}

function getAttackDamage(attack) {
  const invocationAllowsDamage = !attack.damageInvocation || state.activeInvokerInvocation === attack.damageInvocation;
  const ability = attack.damageAbility && invocationAllowsDamage ? getAbilityMod(attack.damageAbility) : 0;
  const prefix = attack.beams ? `${attack.beams} × ` : "";
  const base = `${prefix}${attack.damageDie}${ability ? ` ${formatModifier(ability)}` : ""} ${attack.damageType || ""}`.trim();
  if (!attack.extra) return base;
  const extra = attack.extra.replace("CHA", formatModifier(getAbilityMod("CHA")));
  return `${base} · ${extra}`;
}

function renderAttributes() {
  const container = document.querySelector("#attributeGrid");
  if (!container) return;
  const proficiencies = new Set(DATA.character.savingThrowProficiencies || []);

  container.innerHTML = Object.entries(currentAttributes()).map(([key, value]) => {
    const proficient = proficiencies.has(key);
    const mod = getAbilityMod(key);
    const save = getSaveBonus(key);
    return `
      <article class="attribute-card ${proficient ? "is-proficient" : ""}">
        <span class="ability-name">${key}</span>
        <span class="ability-score">${value}</span>
        <span class="ability-mod">mod ${formatModifier(mod)}</span>
        <strong class="save-bonus">save ${formatModifier(save)}</strong>
        <small>${proficient ? "prof" : "base"}</small>
      </article>
    `;
  }).join("");
}

function renderSkills() {
  const container = document.querySelector("#skillsList");
  if (!container) return;
  container.innerHTML = (DATA.skills || []).map((skill) => {
    const bonus = getSkillBonus(skill);
    return `
      <article class="skill-row ${skill.proficient ? "is-proficient" : ""}" title="${skill.proficient ? "Proficient" : "Base ability"}">
        <span>${skill.name}</span>
        <small>${skill.ability}${skill.proficient ? " · prof" : ""}</small>
        <strong>${formatModifier(bonus)}</strong>
      </article>
    `;
  }).join("");

  setText('[data-field="passivePerception"]', getPassivePerception());
}

function magicDynamicValue(item) {
  if (item.kind === "spellSave") return getSpellSaveDC();
  if (item.kind === "spellAttack") return formatModifier(getSpellAttackBonus());
  if (item.kind === "pactSlots") return `${getResourceValue("pactSlots")} / ${getResource("pactSlots").max} · Level 3`;
  return item.value || "—";
}

function renderMagic() {
  const listContainer = document.querySelector("#magicList");
  if (listContainer) {
    listContainer.innerHTML = DATA.magic.map((item) => `
      <div class="magic-row">
        <span>${item.name}</span>
        <strong>${magicDynamicValue(item)}</strong>
      </div>
    `).join("");
  }

  const cardContainer = document.querySelector("#magicCardGrid");
  if (!cardContainer) return;

  const categories = DATA.magicCategories || [
    { id: "warlock-spells", title: "Warlock Spells", subtitle: "Leveled pact spells." },
    { id: "cantrips", title: "Cantrips", subtitle: "At-will magic." },
    { id: "invocations", title: "Eldritch Invocations", subtitle: "Pact layers." },
    { id: "incubus-magic", title: "Incubus Magic", subtitle: "Heritage magic." }
  ];

  const cards = (DATA.magicCards || []).map((card, index) => mergedCard(card, "magic", index));

  cardContainer.innerHTML = categories.map((category) => {
    const categoryCards = cards.filter((card) => card.category === category.id);
    if (!categoryCards.length) return "";

    const activeCount = categoryCards.filter((card) => isCardPrepared(card)).length;
    const cardHtml = categoryCards.map((card) => {
      const originalIndex = (DATA.magicCards || []).findIndex((item) => cardId(item, 0, "magic") === card.id || item.id === card.id);
      const details = [
        ["Type", card.type || card.tag || "Magic"],
        ["Cost", card.cost || "—"],
        ["Range", card.range || "—"],
        ["Duration", card.duration || "—"],
        [card.kind === "spellSave" ? "Save DC" : card.kind === "spellAttack" ? "Spell Attack" : "Archive", card.kind ? dynamicCardValue(card) : card.invokerPool ? "Invoker Pool" : "Ryo Layer"],
        ["Details", card.detail || "Prepared archive entry."]
      ];
      return flipCardTemplate({
        index: originalIndex >= 0 ? originalIndex : 0,
        group: "magic",
        card,
        details
      });
    }).join("");

    return `
      <section class="magic-category-section" data-magic-category="${safeText(category.id)}">
        <header class="magic-category-header">
          <div>
            <div class="panel-kicker">${safeText(category.title)}</div>
            <h3>${safeText(category.subtitle || "")}</h3>
          </div>
          <span>${activeCount} / ${categoryCards.length} active</span>
        </header>
        <div class="archive-card-grid magic-card-grid categorized-card-grid">${cardHtml}</div>
      </section>
    `;
  }).join("");
}

function renderIdentity() {
  const container = document.querySelector("#identityStack");
  if (!container) return;
  container.innerHTML = DATA.identity.map((item) => `
    <article class="identity-card">
      <h3>${item.title}</h3>
      <p>${item.text}</p>
    </article>
  `).join("");
}

function renderTraces() {
  const container = document.querySelector("#traceList");
  if (!container) return;
  container.innerHTML = DATA.traces.map((trace) => `<li>${trace}</li>`).join("");
}

function renderExhaustion() {
  const container = document.querySelector("#exhaustionDots");
  if (!container) return;
  const current = getResourceValue("exhaustion");
  const max = getResource("exhaustion").max;
  container.innerHTML = Array.from({ length: max + 1 }, (_, value) => `
    <button type="button" class="exhaustion-dot ${value === current ? "is-active" : ""}" data-set-resource="exhaustion" data-value="${value}" aria-label="Set exhaustion to ${value}">${value}</button>
  `).join("");
}

function renderActiveConditions() {
  const container = document.querySelector("#activeConditionList");
  if (!container) return;

  const saves = state.deathSaves || { successes: 0, failures: 0 };
  const seals = [
    {
      id: "hex",
      rune: "☾",
      title: "Hex",
      text: getResourceValue("hex") ? "Active curse. Purple runes mark the target layer." : "Dormant. Ready to mark a target.",
      active: Boolean(getResourceValue("hex")),
      button: getResourceValue("hex") ? `<button type="button" data-toggle-resource="hex" aria-label="Remove Hex">×</button>` : `<button type="button" data-toggle-resource="hex">On</button>`
    },
    {
      id: "concentration",
      rune: "◌",
      title: "Concentration",
      text: getResourceValue("concentration") ? "Spell focus is being maintained." : "No active concentration.",
      active: Boolean(getResourceValue("concentration")),
      button: getResourceValue("concentration") ? `<button type="button" data-toggle-resource="concentration" aria-label="Remove Concentration">×</button>` : `<button type="button" data-toggle-resource="concentration">On</button>`
    },
    {
      id: "rage",
      rune: "♨",
      title: "Rage",
      text: state.form === "rage" ? "Draconic pressure is active." : `${getResourceValue("rage")} / ${getResource("rage").max} uses remain.`,
      active: state.form === "rage"
    },
    {
      id: "tempHp",
      rune: "✹",
      title: "Temp HP",
      text: getResourceValue("tempHp") > 0 ? `${getResourceValue("tempHp")} temporary HP. Demonic protection is active.` : "No temporary shield.",
      active: getResourceValue("tempHp") > 0
    },
    {
      id: "death",
      rune: "✧",
      title: "Death Saves",
      text: saves.successes || saves.failures ? `${saves.successes} successes / ${saves.failures} failures.` : "Centered. No death saves marked.",
      active: Boolean(saves.successes || saves.failures)
    }
  ];

  if (state.form.startsWith("incubus")) {
    seals.push({
      id: "incubus",
      rune: "◆",
      title: getFormLabel(),
      text: "Inherited instinct presses through the soul layer.",
      active: true
    });
  }

  if (getDamageState() === "critical" || getDamageState() === "collapse") {
    seals.push({
      id: "nearDeath",
      rune: "!",
      title: "Near Death",
      text: "The interface darkens and loses energy.",
      active: true
    });
  }

  container.innerHTML = seals.map((card) => `
    <article class="condition-card seal-${card.id} ${card.active ? "is-active" : "is-dormant"}">
      <span class="condition-rune">${card.rune}</span>
      <div><strong>${card.title}</strong><p>${card.text}</p></div>
      ${card.button || ""}
    </article>
  `).join("");
}

function updatePortrait(src) {
  const portrait = document.querySelector("#ryoPortrait");
  if (!portrait) return;

  const fallback = DATA.assets.portraits.base_healthy;
  const nextSrc = src || fallback;
  const visibleSrc = portrait.getAttribute("src");

  if (currentPortraitPath === nextSrc || visibleSrc === nextSrc) {
    currentPortraitPath = nextSrc;
    return;
  }

  const token = ++portraitSwapToken;
  portrait.classList.add("is-transitioning");

  const preload = new Image();
  preload.onload = () => {
    if (token !== portraitSwapToken) return;
    window.setTimeout(() => {
      if (token !== portraitSwapToken) return;
      portrait.src = nextSrc;
      currentPortraitPath = nextSrc;
      portrait.onerror = () => {
        portrait.onerror = null;
        portrait.src = fallback;
        currentPortraitPath = fallback;
      };
      requestAnimationFrame(() => portrait.classList.remove("is-transitioning"));
    }, 140);
  };
  preload.onerror = () => {
    if (token !== portraitSwapToken) return;
    portrait.src = fallback;
    currentPortraitPath = fallback;
    portrait.classList.remove("is-transitioning");
  };
  preload.src = nextSrc;
}

function renderManifestationControls() {
  const stage = getIncubusStage();
  const rageValue = getResourceValue("rage");
  const rageMax = getResource("rage").max;

  setText("#rageChargeText", `${rageValue} / ${rageMax}`);
  setText("#incubusStageText", stage ? `stage ${stage}` : "stage 0");

  const rageButton = document.querySelector("#rageButton");
  if (rageButton) rageButton.disabled = rageValue <= 0 && state.form !== "rage";

  document.querySelectorAll("[data-form-action]").forEach((button) => {
    const action = button.dataset.formAction;
    const active =
      (action === "base" && state.form === "base") ||
      (action === "rage" && state.form === "rage") ||
      (action === "incubus" && state.form.startsWith("incubus"));
    button.classList.toggle("is-active", active);
  });
}

function renderManifestation() {
  const changed = normalizeState();
  if (changed) saveState();
  const damage = getDamageState();
  document.body.className = `archive-state form-${state.form} damage-${damage}`;

  setText("#manifestationLabel", `${getFormLabel()} · ${getDamageLabel(damage)}`);
  setText("#manifestationNote", getManifestationNote());
  setText("#pactSlotReadout", `${getResourceValue("pactSlots")} / ${getResource("pactSlots").max}`);
  setText("#rageReadout", `${getResourceValue("rage")} / ${getResource("rage").max}`);
  setText("#hexReadout", getResourceValue("hex") ? "Active" : "Dormant");
  setText("#concentrationReadout", getResourceValue("concentration") ? "Active" : "Dormant");

  updatePortrait(getPortraitPath());

  renderManifestationControls();
}

function renderCoreSettings() {
  const container = document.querySelector("#coreSettingGrid");
  if (!container) return;
  const attributes = currentAttributes();
  const attrControls = Object.entries(attributes).map(([key, value]) => `
    <div class="core-setting-row">
      <span>${key}</span>
      <button type="button" data-adjust-attribute="${key}" data-step="-1">−</button>
      <strong>${value}</strong>
      <button type="button" data-adjust-attribute="${key}" data-step="1">+</button>
    </div>
  `).join("");

  container.innerHTML = `
    <div class="core-setting-row proficiency-setting">
      <span>PB</span>
      <button type="button" data-adjust-proficiency data-step="-1">−</button>
      <strong>+${getProficiencyBonus()}</strong>
      <button type="button" data-adjust-proficiency data-step="1">+</button>
    </div>
    ${attrControls}
  `;
}

function renderSessionInputs() {
  const inspiration = document.querySelector("#inspirationCheck");
  if (inspiration) inspiration.checked = Boolean(state.inspiration);

  const notes = document.querySelector("#quickNotes");
  if (notes && notes.value !== state.notes) notes.value = state.notes || "";
}

function setActiveTab(tabName) {
  state.activeTab = tabName;
  saveState();
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === tabName);
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.panel === tabName);
  });
}

function setResourceSilently(id, value) {
  const resource = getResource(id);
  if (!resource) return;
  state.resources[id] = clamp(value, resource.min, resource.max);
}

function applyDamage(amount) {
  const currentTemp = getResourceValue("tempHp");
  const absorbed = Math.min(currentTemp, amount);
  const remaining = amount - absorbed;
  setResourceSilently("tempHp", currentTemp - absorbed);
  setResourceSilently("hp", getResourceValue("hp") - remaining);
}

function applyBulkHp(mode) {
  const input = document.querySelector("#hpAmountInput");
  const amount = clamp(Number(input?.value || 0), 0, 999);
  if (!amount && mode !== "temp") return;

  if (mode === "damage") applyDamage(amount);
  if (mode === "heal") {
    setResourceSilently("hp", getResourceValue("hp") + amount);
    if (getResourceValue("hp") > 0) state.deathSaves = { successes: 0, failures: 0 };
  }
  if (mode === "temp") setResourceSilently("tempHp", amount);

  if (input) input.value = "";
  saveState();
  render();
}

function shortRest() {
  state.resources.pactSlots = getResource("pactSlots").max;
  if (getResourceValue("hp") > 0) state.deathSaves = { successes: 0, failures: 0 };
  saveState();
  render();
}

function longRest() {
  DATA.resources.forEach((resource) => {
    if (["hp", "pactSlots", "rage"].includes(resource.id)) state.resources[resource.id] = resource.max;
    if (["tempHp", "hex", "concentration", "exhaustion"].includes(resource.id)) state.resources[resource.id] = resource.min;
  });
  state.deathSaves = { successes: 0, failures: 0 };
  state.form = "base";
  state.inspiration = false;
  saveState();
  render();
}

function baseCardById(group, id, index) {
  const list = group === "magic" ? (DATA.magicCards || []) : group === "combat" ? (DATA.attacks || []) : [];
  return list.find((card, cardIndex) => cardId(card, cardIndex, group) === id || card.id === id) || list[Number(index)] || null;
}

function toggleCardAvailabilityFromButton(button) {
  const cardElement = button.closest("[data-flip-card]");
  const group = button.dataset.cardGroup || cardElement?.dataset.cardGroup || "magic";
  const id = button.dataset.cardId || cardElement?.dataset.cardId;
  const index = cardElement?.dataset.cardIndex;
  const base = baseCardById(group, id, index);
  if (!base || base.alwaysActive || base.invokerPool) return;
  const effective = mergedCard(base, group, Number(index || 0));
  const current = isCardPrepared(effective);
  state.cardAvailability[id] = !current;
  saveState();
  render();
  openFlipCard(document.querySelector(`[data-flip-card][data-card-group="${CSS.escape(group)}"][data-card-id="${CSS.escape(id)}"]`));
}

function setActiveInvoker(id) {
  const card = (DATA.magicCards || []).find((item) => item.id === id && item.invokerPool);
  if (!card) return;
  state.activeInvokerInvocation = id;
  saveState();
  render();
  openFlipCard(document.querySelector(`[data-flip-card][data-card-group="magic"][data-card-id="${CSS.escape(id)}"]`));
}

function beginCardEdit(button) {
  const card = button.closest("[data-flip-card]");
  if (!card) return;
  card.classList.add("is-editing");
}

function collectCardEditValues(cardElement) {
  const values = {};
  cardElement.querySelectorAll("[data-card-edit-field]").forEach((field) => {
    values[field.dataset.cardEditField] = field.value.trim();
  });
  return values;
}

function saveCardEdit(button) {
  const cardElement = button.closest("[data-flip-card]");
  if (!cardElement) return;
  const group = cardElement.dataset.cardGroup;
  const id = cardElement.dataset.cardId;
  const values = collectCardEditValues(cardElement);
  state.cardOverrides[group] = state.cardOverrides[group] || {};
  state.cardOverrides[group][id] = values;
  saveState();
  render();
  openFlipCard(document.querySelector(`[data-flip-card][data-card-group="${CSS.escape(group)}"][data-card-id="${CSS.escape(id)}"]`));
}

function resetCardEdit(button) {
  const cardElement = button.closest("[data-flip-card]");
  if (!cardElement) return;
  const group = cardElement.dataset.cardGroup;
  const id = cardElement.dataset.cardId;
  if (state.cardOverrides?.[group]) delete state.cardOverrides[group][id];
  saveState();
  render();
  openFlipCard(document.querySelector(`[data-flip-card][data-card-group="${CSS.escape(group)}"][data-card-id="${CSS.escape(id)}"]`));
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-tab]");
    if (tab) setActiveTab(tab.dataset.tab);

    const closeCard = event.target.closest("[data-close-card]");
    if (closeCard) {
      closeExpandedCards();
      return;
    }

    const setInvoker = event.target.closest("[data-set-invoker]");
    if (setInvoker) {
      setActiveInvoker(setInvoker.dataset.setInvoker);
      return;
    }

    const availabilityToggle = event.target.closest("[data-toggle-card-availability]");
    if (availabilityToggle) {
      toggleCardAvailabilityFromButton(availabilityToggle);
      return;
    }

    const editCard = event.target.closest("[data-edit-card]");
    if (editCard) {
      beginCardEdit(editCard);
      return;
    }

    const saveCard = event.target.closest("[data-save-card-edit]");
    if (saveCard) {
      saveCardEdit(saveCard);
      return;
    }

    const resetCard = event.target.closest("[data-reset-card-edit]");
    if (resetCard) {
      resetCardEdit(resetCard);
      return;
    }

    const flipCard = event.target.closest("[data-flip-card]");
    if (flipCard) {
      openFlipCard(flipCard);
      return;
    }

    if (document.body.classList.contains("card-overlay-active") && !event.target.closest("[data-flip-card]")) {
      closeExpandedCards();
      return;
    }

    const formAction = event.target.closest("[data-form-action]");
    if (formAction) {
      const action = formAction.dataset.formAction;
      if (action === "base") activateBaseForm();
      if (action === "rage") activateRageForm(formAction);
      if (action === "incubus") advanceIncubusForm();
    }

    const adjust = event.target.closest("[data-adjust-resource]");
    if (adjust) {
      const id = adjust.dataset.adjustResource;
      const step = Number(adjust.dataset.step);
      setResourceValue(id, getResourceValue(id) + step);
    }

    const hpApply = event.target.closest("[data-apply-hp]");
    if (hpApply) applyBulkHp(hpApply.dataset.applyHp);

    const restAction = event.target.closest("[data-rest-action]");
    if (restAction) {
      if (restAction.dataset.restAction === "short") shortRest();
      if (restAction.dataset.restAction === "long") longRest();
    }

    const attrAdjust = event.target.closest("[data-adjust-attribute]");
    if (attrAdjust) {
      const ability = attrAdjust.dataset.adjustAttribute;
      const step = Number(attrAdjust.dataset.step || 0);
      state.attributes = { ...currentAttributes(), [ability]: clamp(getAttributeScore(ability) + step, 1, 30) };
      saveState();
      render();
    }

    const pbAdjust = event.target.closest("[data-adjust-proficiency]");
    if (pbAdjust) {
      const step = Number(pbAdjust.dataset.step || 0);
      state.proficiencyBonus = clamp(getProficiencyBonus() + step, 0, 10);
      saveState();
      render();
    }

    const deathAdjust = event.target.closest("[data-adjust-death]");
    if (deathAdjust) {
      const kind = deathAdjust.dataset.adjustDeath === "success" ? "successes" : "failures";
      state.deathSaves[kind] = clamp((state.deathSaves?.[kind] || 0) + 1, 0, 3);
      saveState();
      render();
    }

    const deathSet = event.target.closest("[data-set-death]");
    if (deathSet) {
      const kind = deathSet.dataset.setDeath === "success" ? "successes" : "failures";
      state.deathSaves[kind] = clamp(Number(deathSet.dataset.value), 0, 3);
      saveState();
      render();
    }

    const deathReset = event.target.closest("[data-reset-death]");
    if (deathReset) {
      state.deathSaves = { successes: 0, failures: 0 };
      saveState();
      render();
    }

    const setResource = event.target.closest("[data-set-resource]");
    if (setResource) {
      setResourceValue(setResource.dataset.setResource, Number(setResource.dataset.value));
    }

    const toggle = event.target.closest("[data-toggle-resource]");
    if (toggle) {
      const id = toggle.dataset.toggleResource;
      setResourceValue(id, getResourceValue(id) ? 0 : 1);
    }

    const focus = event.target.closest("[data-focus-resource]");
    if (focus && focus.dataset.focusResource) {
      setActiveTab("status");
      const card = document.querySelector(`[data-resource-card="${focus.dataset.focusResource}"]`) || document.querySelector(".vital-core");
      card?.scrollIntoView({ behavior: "smooth", block: "center" });
      card?.classList.add("is-pulsing");
      setTimeout(() => card?.classList.remove("is-pulsing"), 900);
    }
  });

  document.querySelector("#shortRestButton")?.addEventListener("click", shortRest);
  document.querySelector("#longRestButton")?.addEventListener("click", longRest);

  document.querySelector("#resetButton")?.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    state = clone(DEFAULT_STATE);
    render();
  });

  document.querySelector("#inspirationCheck")?.addEventListener("change", (event) => {
    state.inspiration = event.target.checked;
    saveState();
  });

  document.querySelector("#quickNotes")?.addEventListener("input", (event) => {
    state.notes = event.target.value;
    saveState();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeExpandedCards();
    const card = event.target.closest?.("[data-flip-card]");
    if (card && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      openFlipCard(card);
    }
  });
}

function render() {
  renderHero();
  renderVitalCore();
  renderDeathGate();
  renderResources();
  renderActions("#actionCards");
  renderActions("#combatActionCards");
  renderAttributes();
  renderSkills();
  renderMagic();
  renderIdentity();
  renderTraces();
  renderExhaustion();
  renderActiveConditions();
  renderManifestation();
  renderCoreSettings();
  renderSessionInputs();
  setActiveTab(state.activeTab);
}

bindEvents();
render();
console.log("Dragon Archive V1 reference-style overlay loaded.");
