const DATA = window.DRAGON_ARCHIVE_DATA;
const STORAGE_KEY = "dragonArchive.v1.ryo.currentState";

const DEFAULT_STATE = {
  activeTab: "status",
  form: "base",
  resources: Object.fromEntries(DATA.resources.map((resource) => [resource.id, resource.current]))
};

let state = loadState();

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored) return structuredClone(DEFAULT_STATE);
    return {
      ...structuredClone(DEFAULT_STATE),
      ...stored,
      resources: {
        ...DEFAULT_STATE.resources,
        ...(stored.resources || {})
      }
    };
  } catch (error) {
    console.warn("Dragon Archive state could not be loaded.", error);
    return structuredClone(DEFAULT_STATE);
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
  return clamp(state.resources[id] ?? resource.current, resource.min, resource.max);
}

function setResourceValue(id, value) {
  const resource = getResource(id);
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
  if (state.form.startsWith("incubus")) return "An old instinct moves beneath the surface.";
  if (damage === "critical") return "Close to collapse, still refusing to fall.";
  if (damage === "wounded") return "The archive records strain, blood and endurance.";
  return "Silent guardian. Controlled presence.";
}

function getPortraitPath() {
  const damage = getDamageState();
  const key = `${state.form}_${damage}`;
  return DATA.assets.portraits[key] || DATA.assets.portraits.base_healthy;
}

function renderHero() {
  const heroRings = document.querySelector("#heroRings");
  const primary = [
    { label: "AC", value: DATA.character.armorClass, max: 30, kind: "fixed" },
    { label: "HP", value: getResourceValue("hp"), max: getResource("hp").max, kind: "resource", id: "hp" },
    { label: "Temp", value: getResourceValue("tempHp"), max: getResource("tempHp").max, kind: "resource", id: "tempHp" },
    { label: "Slots", value: getResourceValue("pactSlots"), max: getResource("pactSlots").max, kind: "resource", id: "pactSlots" }
  ];

  heroRings.innerHTML = primary.map((ring) => {
    const percent = ring.max ? Math.round((Number(ring.value) / ring.max) * 100) : 100;
    const style = `--ring-fill: ${clamp(percent, 0, 100)}%;`;
    return `
      <button class="resource-ring ${ring.kind === "resource" ? "is-clickable" : ""}" type="button" data-focus-resource="${ring.id || ""}" style="${style}" aria-label="${ring.label} ${ring.value}">
        <span class="resource-label">${ring.label}</span>
        <strong>${ring.value}</strong>
      </button>
    `;
  }).join("");
}

function renderResources() {
  const container = document.querySelector("#resourceCards");
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
      <span>${attack.tag}</span>
      <h3>${attack.name}</h3>
      <dl>
        <div><dt>Attack</dt><dd>${attack.attack}</dd></div>
        <div><dt>Damage</dt><dd>${attack.damage}</dd></div>
      </dl>
      <p>${attack.note}</p>
    </article>
  `).join("");
}

function renderAttributes() {
  const container = document.querySelector("#attributeGrid");
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
  container.innerHTML = DATA.traces.map((trace) => `<li>${trace}</li>`).join("");
}

function renderManifestation() {
  const damage = getDamageState();
  document.body.className = `archive-state form-${state.form} damage-${damage}`;

  const formReadout = document.querySelector("#formReadout");
  const damageReadout = document.querySelector("#damageReadout");
  const controlReadout = document.querySelector("#controlReadout");
  const manifestationLabel = document.querySelector("#manifestationLabel");
  const manifestationNote = document.querySelector("#manifestationNote");
  const portrait = document.querySelector("#ryoPortrait");
  const formSelect = document.querySelector("#formSelect");

  formReadout.textContent = getFormLabel();
  damageReadout.textContent = getDamageLabel(damage);
  controlReadout.textContent = getControlLabel();
  manifestationLabel.textContent = `${getFormLabel()} · ${getDamageLabel(damage)}`;
  manifestationNote.textContent = getManifestationNote();
  formSelect.value = state.form;

  portrait.src = getPortraitPath();
  portrait.onerror = () => {
    portrait.onerror = null;
    portrait.src = DATA.assets.portraits.base_healthy;
  };
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

function bindEvents() {
  document.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-tab]");
    if (tab) setActiveTab(tab.dataset.tab);

    const adjust = event.target.closest("[data-adjust-resource]");
    if (adjust) {
      const id = adjust.dataset.adjustResource;
      const step = Number(adjust.dataset.step);
      setResourceValue(id, getResourceValue(id) + step);
    }

    const toggle = event.target.closest("[data-toggle-resource]");
    if (toggle) {
      const id = toggle.dataset.toggleResource;
      setResourceValue(id, getResourceValue(id) ? 0 : 1);
    }

    const focus = event.target.closest("[data-focus-resource]");
    if (focus && focus.dataset.focusResource) {
      setActiveTab("status");
      const card = document.querySelector(`[data-resource-card="${focus.dataset.focusResource}"]`);
      card?.scrollIntoView({ behavior: "smooth", block: "center" });
      card?.classList.add("is-pulsing");
      setTimeout(() => card?.classList.remove("is-pulsing"), 900);
    }
  });

  document.querySelector("#formSelect").addEventListener("change", (event) => {
    state.form = event.target.value;
    saveState();
    render();
  });

  document.querySelector("#longRestButton").addEventListener("click", () => {
    DATA.resources.forEach((resource) => {
      if (["hp", "pactSlots", "rage"].includes(resource.id)) state.resources[resource.id] = resource.max;
      if (["tempHp", "hex", "exhaustion"].includes(resource.id)) state.resources[resource.id] = resource.min;
    });
    state.form = "base";
    saveState();
    render();
  });

  document.querySelector("#resetButton").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    state = structuredClone(DEFAULT_STATE);
    render();
  });
}

function render() {
  renderHero();
  renderResources();
  renderActions("#actionCards");
  renderActions("#combatActionCards");
  renderAttributes();
  renderMagic();
  renderIdentity();
  renderTraces();
  renderManifestation();
  setActiveTab(state.activeTab);
}

bindEvents();
render();
console.log("Dragon Archive V1 loaded.");
