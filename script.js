const DATA = window.DRAGON_ARCHIVE_DATA;
const STORAGE_KEY = "dragonArchive.v1.ryo.currentState";

const DEFAULT_STATE = {
  activeTab: "status",
  form: "base",
  inspiration: false,
  notes: "",
  resources: Object.fromEntries(DATA.resources.map((resource) => [resource.id, resource.current]))
};

let state = loadState();

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
  if (ratio <= 0.25) return "critical";
  if (ratio <= 0.75) return "wounded";
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
  if (damage === "wounded") return "The archive records strain, blood and endurance.";
  return "Silent guardian. Controlled presence.";
}

function getPortraitPath() {
  const damage = getDamageState();
  const key = `${state.form}_${damage}`;
  return DATA.assets.portraits[key] || DATA.assets.portraits.base_healthy;
}

function getIncubusStage() {
  if (state.form === "incubus1") return 1;
  if (state.form === "incubus2") return 2;
  if (state.form === "incubus3") return 3;
  return 0;
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

  const primary = [
    { label: "AC", value: DATA.character.armorClass, sub: "Armor", max: 30, kind: "fixed" },
    { label: "HP", value: getResourceValue("hp"), sub: `/${getResource("hp").max}`, max: getResource("hp").max, kind: "resource", id: "hp" },
    { label: "PB", value: `+${DATA.character.proficiencyBonus}`, sub: "Prof", max: 6, kind: "fixed" }
  ];

  heroRings.innerHTML = primary.map((ring) => {
    const rawValue = Number(String(ring.value).replace("+", ""));
    const percent = ring.max ? Math.round((rawValue / ring.max) * 100) : 100;
    const style = `--ring-fill: ${clamp(percent, 0, 100)}%;`;
    return `
      <button class="resource-ring ${ring.kind === "resource" ? "is-clickable" : ""}" type="button" data-focus-resource="${ring.id || ""}" style="${style}" aria-label="${ring.label} ${ring.value}">
        <span class="resource-label">${ring.label}</span>
        <strong>${ring.value}</strong>
        <small>${ring.sub || ""}</small>
      </button>
    `;
  }).join("");
}

function renderVitalCore() {
  const hp = getResourceValue("hp");
  const hpMax = getResource("hp").max;
  const tempHp = getResourceValue("tempHp");
  const percent = hpMax ? Math.round((hp / hpMax) * 100) : 0;
  const deathPercent = clamp(100 - percent, 0, 100);

  setText("#largeHpValue", hp);
  setText("#largeHpMax", `/${hpMax}`);
  setText("#tempHpValue", tempHp);

  const hpRing = document.querySelector("#largeHpRing");
  if (hpRing) hpRing.style.setProperty("--hp-fill", `${clamp(percent, 0, 100)}%`);

  const pointer = document.querySelector("#deathPointer");
  if (pointer) pointer.style.left = `${deathPercent}%`;

  const damage = getDamageState();
  const flavor = {
    healthy: "Green at full health, steady and controlled.",
    wounded: "The light sinks toward gold. The archive records strain.",
    critical: "Deep red pressure. Ryo is close to collapse, but still standing.",
    collapse: "The archive light is nearly extinguished."
  };
  setText("#hpFlavor", flavor[damage]);
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

function renderActions(targetId) {
  const container = document.querySelector(targetId);
  if (!container) return;
  container.innerHTML = DATA.attacks.map((attack) => `
    <article class="action-card">
      <div>
        <span>${attack.tag}</span>
        <h3>${attack.name}</h3>
      </div>
      <dl>
        <div><dt>To Hit</dt><dd>${attack.attack}</dd></div>
        <div><dt>Damage</dt><dd>${attack.damage}</dd></div>
      </dl>
      <p>${attack.note}</p>
    </article>
  `).join("");
}

function renderAttributes() {
  const container = document.querySelector("#attributeGrid");
  if (!container) return;
  container.innerHTML = Object.entries(DATA.attributes).map(([key, value]) => {
    const modifier = Math.floor((value - 10) / 2);
    const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;
    return `
      <article class="attribute-card">
        <span>${key}</span>
        <strong>${value}</strong>
        <small>${modifierText}</small>
      </article>
    `;
  }).join("");
}

function renderMagic() {
  const container = document.querySelector("#magicList");
  if (!container) return;
  container.innerHTML = DATA.magic.map((item) => `
    <div class="magic-row">
      <span>${item.name}</span>
      <strong>${item.value}</strong>
    </div>
  `).join("");
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

  const cards = [];
  if (getResourceValue("hex")) {
    cards.push({ id: "hex", rune: "☾", title: "Hex", text: "Purple curse runes cling to the target layer." });
  }
  if (getResourceValue("tempHp") > 0) {
    cards.push({ id: "tempHp", rune: "✹", title: "Dark One's Blessing", text: `${getResourceValue("tempHp")} temporary HP. Demonic protection is active.` });
  }
  if (state.form === "rage") {
    cards.push({ id: "rageForm", rune: "♨", title: "Rage / Draconic Shift", text: "The archive burns hotter around Ryo's draconic side." });
  }
  if (state.form.startsWith("incubus")) {
    cards.push({ id: "incubusForm", rune: "✦", title: getFormLabel(), text: "A left-sided inherited instinct presses through the soul layer." });
  }
  if (getDamageState() === "critical" || getDamageState() === "collapse") {
    cards.push({ id: "nearDeath", rune: "!", title: "Near Death", text: "The interface darkens and loses energy." });
  }

  if (!cards.length) {
    container.innerHTML = `<p class="panel-copy">No active condition echoes. The archive is steady.</p>`;
    return;
  }

  container.innerHTML = cards.map((card) => `
    <article class="condition-card">
      <span class="condition-rune">${card.rune}</span>
      <div><strong>${card.title}</strong><p>${card.text}</p></div>
      ${card.id === "hex" ? `<button type="button" data-toggle-resource="hex" aria-label="Remove Hex">×</button>` : ""}
    </article>
  `).join("");
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
  const damage = getDamageState();
  document.body.className = `archive-state form-${state.form} damage-${damage}`;

  setText("#manifestationLabel", `${getFormLabel()} · ${getDamageLabel(damage)}`);
  setText("#manifestationNote", getManifestationNote());
  setText("#pactSlotReadout", `${getResourceValue("pactSlots")} / ${getResource("pactSlots").max}`);
  setText("#rageReadout", `${getResourceValue("rage")} / ${getResource("rage").max}`);

  const portrait = document.querySelector("#ryoPortrait");
  if (portrait) {
    portrait.src = getPortraitPath();
    portrait.onerror = () => {
      portrait.onerror = null;
      portrait.src = DATA.assets.portraits.base_healthy;
    };
  }

  renderManifestationControls();
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

function longRest() {
  DATA.resources.forEach((resource) => {
    if (["hp", "pactSlots", "rage"].includes(resource.id)) state.resources[resource.id] = resource.max;
    if (["tempHp", "hex", "exhaustion"].includes(resource.id)) state.resources[resource.id] = resource.min;
  });
  state.form = "base";
  state.inspiration = false;
  saveState();
  render();
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-tab]");
    if (tab) setActiveTab(tab.dataset.tab);

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
}

function render() {
  renderHero();
  renderVitalCore();
  renderResources();
  renderActions("#actionCards");
  renderActions("#combatActionCards");
  renderAttributes();
  renderMagic();
  renderIdentity();
  renderTraces();
  renderExhaustion();
  renderActiveConditions();
  renderManifestation();
  renderSessionInputs();
  setActiveTab(state.activeTab);
}

bindEvents();
render();
console.log("Dragon Archive V1 reference-style overlay loaded.");
