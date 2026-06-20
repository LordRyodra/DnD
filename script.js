const STORAGE_KEY = 'ryo-dnd-hud-v01';
const pages = ['Status','Combat','Magic','Inventory','Character','Quests','Library','Settings'];

const defaultState = {
  character: {
    name: 'Ryo', classes: 'Warlock 4 / Paladin 2', level: 6, pb: 3, ac: 16, initiative: 0, speed: '9 m',
    hpMax: 57, hpCurrent: 21, tempHp: 8, hitDice: { d8: 4, d10: 2 }, deathSaves: { success: 0, fail: 0 },
    stats: { STR: 16, DEX: 10, CON: 16, INT: 9, WIS: 16, CHA: 19 }, baseCha: 20,
    saves: ['Wisdom', 'Charisma'], skills: ['Athletics', 'Insight', 'Animal Handling', 'Persuasion', 'Perception'],
    languages: ['Common', 'Draconic', 'Elvish', 'Infernal', 'Giant']
  },
  resources: { layOnHands: 10, layOnHandsMax: 10, divineSense: 5, divineSenseMax: 5, pactSlots: 2, pactSlotsMax: 2, spellSlots1: 2, spellSlots1Max: 2, darkOnesBlessing: 0 },
  combat: {
    concentration: false, hex: false,
    conditions: [],
    attacks: [
      { name: 'Greataxe of Ragna', bonus: '+8', damage: '1d12 + 5 slashing', notes: 'Dragon-pact weapon. No charges currently.' },
      { name: 'Oni-san', bonus: '+6', damage: '1d8 + 3 bludgeoning', notes: 'Melee weapon.' },
      { name: 'Dagger', bonus: '+6 / +3', damage: '1d4 + 3 piercing', notes: 'Melee or ranged.' },
      { name: 'Eldritch Blast', bonus: '+7', damage: '2 beams, 1d10 each', notes: 'Spell attack.' }
    ]
  },
  magic: {
    spellSaveDc: 15, spellAttack: '+7', pact: 'Fiend', boon: 'Pact of the Invoker',
    invocations: ['Mask of Many Faces → Disguise Self', 'Beast Speech → Speak with Animals', 'Guidance', 'Mage Hand', 'Resistance'],
    cantrips: ['Eldritch Blast', 'Green-Flame Blade', 'Prestidigitation', 'Guidance', 'Mage Hand', 'Resistance'],
    spells: ['Distort Value', 'Hex', 'Witch Bolt', 'Hold Person', 'Misty Step', 'Burning Hands', 'Command', 'Searing Smite', 'Wrathful Smite', 'Divine Smite'],
    notes: 'Pact of the Invoker is homebrew. Update exact rules later.'
  },
  inventory: {
    currency: { CP: 0, SP: 0, GP: 0, PP: 0 },
    items: [
      { category: 'Equipment', name: 'Greataxe of Ragna', qty: 1, notes: 'No greataxe charges available yet.' },
      { category: 'Armor', name: 'Chain Mail', qty: 1, notes: 'AC 16.' },
      { category: 'Equipment', name: 'Bag of Holding', qty: 1, notes: '' },
      { category: 'Valuables', name: 'Dragon Pipe', qty: 1, notes: 'Inherited.' }
    ]
  },
  quests: [
    { type: 'Personal Quest', status: 'Active', title: 'Hunt the Patron', progress: 'Find and destroy the fiend behind Ryo’s curse and pact.' }
  ],
  library: [
    { category: 'Lore', title: 'Ragna', body: 'Dragon mentor/father figure. Details to expand.' },
    { category: 'NPC', title: 'Asmodeus Avatar', body: 'Linked to the tragedy and pact origin.' }
  ],
  notes: ''
};

let state = loadState();

function loadState(){
  try { return { ...structuredClone(defaultState), ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}) }; }
  catch { return structuredClone(defaultState); }
}
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function el(tag, cls='', html=''){ const x=document.createElement(tag); if(cls) x.className=cls; if(html) x.innerHTML=html; return x; }
const mod = v => Math.floor((v-10)/2);
const signed = n => n >= 0 ? `+${n}` : `${n}`;

function initNav(){
  const nav = document.getElementById('nav');
  nav.innerHTML = '';
  pages.forEach(p => {
    const b = el('button', '', p);
    b.onclick = () => showPage(p.toLowerCase());
    b.dataset.page = p.toLowerCase();
    nav.appendChild(b);
  });
}
function showPage(id){
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === id));
  document.querySelectorAll('.nav button').forEach(b => b.classList.toggle('active', b.dataset.page === id));
}

function render(){
  document.querySelector('[data-bind="ac"]').textContent = state.character.ac;
  renderStatus(); renderCombat(); renderMagic(); renderInventory(); renderCharacter(); renderQuests(); renderLibrary(); renderSettings();
  save();
}
function page(id){ const p=document.getElementById(id); p.innerHTML=''; return p; }

function ring(label, current, max, color, onChange){
  const pct = Math.max(0, Math.min(100, max ? current/max*100 : 0));
  const card = el('div','panel card stat-ring');
  card.innerHTML = `<div class="ring" style="--pct:${pct}%;--color:${color}"><div class="ring-inner"><div><p class="label">${label}</p><strong>${current}/${max}</strong></div></div></div>`;
  const c = el('div','controls');
  [-10,-5,-1,1,5,10].forEach(n => { const b=el('button','', n>0?`+${n}`:n); b.onclick=()=>{onChange(n); render();}; c.appendChild(b); });
  card.appendChild(c);
  return card;
}
function counter(label, key, maxKey, hint=''){
  const t = document.getElementById('counter-template').content.cloneNode(true);
  t.querySelector('.label').textContent = label;
  t.querySelector('.hint').textContent = hint;
  t.querySelector('.value').textContent = `${state.resources[key]}/${state.resources[maxKey]}`;
  t.querySelector('.minus').onclick = () => { state.resources[key]=Math.max(0,state.resources[key]-1); render(); };
  t.querySelector('.plus').onclick = () => { state.resources[key]=Math.min(state.resources[maxKey],state.resources[key]+1); render(); };
  return t;
}
function renderStatus(){
  const p=page('status');
  const g=el('div','grid grid-3');
  g.append(
    ring('HP', state.character.hpCurrent, state.character.hpMax, state.character.hpCurrent/state.character.hpMax < .35 ? 'var(--danger)' : 'var(--dragon)', n=> state.character.hpCurrent=Math.max(0,Math.min(state.character.hpMax,state.character.hpCurrent+n))),
    ring('TEMP HP', state.character.tempHp, Math.max(1, state.character.tempHp || 8), 'var(--accent)', n=> state.character.tempHp=Math.max(0,state.character.tempHp+n)),
    ring('DARK ONE', state.resources.darkOnesBlessing, Math.max(1,state.character.level + mod(state.character.stats.CHA)), 'var(--warn)', n=> state.resources.darkOnesBlessing=Math.max(0,state.resources.darkOnesBlessing+n))
  );
  p.appendChild(g);
  const r=el('div','grid grid-3');
  const card=el('div','panel card'); card.innerHTML='<h2>Rest Resources</h2><div class="resource-list"></div>';
  const list=card.querySelector('.resource-list');
  list.append(counter('Lay on Hands','layOnHands','layOnHandsMax','Paladin 2: 10 HP pool'), counter('Divine Sense','divineSense','divineSenseMax','2014: 1 + CHA mod = 5'), counter('Pact Slots','pactSlots','pactSlotsMax','Warlock slots'));
  const hd=el('div','panel card',`<h2>Hit Dice</h2><p><span class="badge">${state.character.hitDice.d8}d8 Warlock</span> <span class="badge">${state.character.hitDice.d10}d10 Paladin</span></p>`);
  const ds=el('div','panel card',`<h2>Death Saves</h2><p>Successes: ${'◆'.repeat(state.character.deathSaves.success)}${'◇'.repeat(3-state.character.deathSaves.success)}</p><p>Failures: ${'◆'.repeat(state.character.deathSaves.fail)}${'◇'.repeat(3-state.character.deathSaves.fail)}</p><div class="controls"><button id="dsS">Success</button><button id="dsF">Fail</button><button id="dsR">Reset</button></div>`);
  r.append(card,hd,ds); p.appendChild(r);
  ds.querySelector('#dsS').onclick=()=>{state.character.deathSaves.success=Math.min(3,state.character.deathSaves.success+1);render();};
  ds.querySelector('#dsF').onclick=()=>{state.character.deathSaves.fail=Math.min(3,state.character.deathSaves.fail+1);render();};
  ds.querySelector('#dsR').onclick=()=>{state.character.deathSaves={success:0,fail:0};render();};
}
function renderCombat(){
  const p=page('combat');
  const top=el('div','grid grid-3');
  top.innerHTML = `<div class="panel card"><h2>Combat State</h2><p><span class="badge ${state.combat.concentration?'warn':''}">Concentration: ${state.combat.concentration?'Active':'Off'}</span> <span class="badge ${state.combat.hex?'warn':''}">Hex: ${state.combat.hex?'Active':'Off'}</span></p><div class="controls"><button id="conc">Toggle Concentration</button><button id="hex">Toggle Hex</button></div></div>
  <div class="panel card"><h2>Defenses</h2><p>AC ${state.character.ac} · Initiative ${signed(state.character.initiative)} · Speed ${state.character.speed}</p><p>Saves: ${state.character.saves.map(s=>`<span class="badge">${s}</span>`).join('')}</p></div>
  <div class="panel card"><h2>Conditions</h2><p>${state.combat.conditions.length?state.combat.conditions.map(c=>`<span class="badge danger">${c}</span>`).join(''):'No active conditions.'}</p><div class="form-row"><input id="conditionInput" placeholder="Add condition"><button id="addCondition">Add</button><button id="clearConditions">Clear</button></div></div>`;
  p.appendChild(top);
  const atk=el('div','panel card'); atk.innerHTML='<h2>Attacks</h2>'+table(['Attack','Bonus','Damage','Notes'], state.combat.attacks.map(a=>[a.name,a.bonus,a.damage,a.notes])); p.appendChild(atk);
  top.querySelector('#conc').onclick=()=>{state.combat.concentration=!state.combat.concentration;render();};
  top.querySelector('#hex').onclick=()=>{state.combat.hex=!state.combat.hex;render();};
  top.querySelector('#addCondition').onclick=()=>{const v=document.getElementById('conditionInput').value.trim(); if(v) state.combat.conditions.push(v); render();};
  top.querySelector('#clearConditions').onclick=()=>{state.combat.conditions=[];render();};
}
function renderMagic(){
  const p=page('magic');
  p.innerHTML = `<div class="grid grid-3"><div class="panel card"><h2>Spellcasting</h2><p>Spell Save DC <strong>${state.magic.spellSaveDc}</strong></p><p>Spell Attack <strong>${state.magic.spellAttack}</strong></p><p>CHA current ${state.character.stats.CHA} · base ${state.character.baseCha}</p></div><div class="panel card"><h2>Pact</h2><p>Patron: <span class="badge">${state.magic.pact}</span></p><p>Boon: <span class="badge">${state.magic.boon}</span></p></div><div class="panel card"><h2>Slots</h2><div class="resource-list" id="slotList"></div></div></div>`;
  document.getElementById('slotList').append(counter('Pact Slots','pactSlots','pactSlotsMax','Short rest'), counter('1st-Level Spell Slots','spellSlots1','spellSlots1Max','Paladin'));
  const lists=el('div','grid grid-3');
  lists.innerHTML = `<div class="panel card"><h2>Invocations / Boon Features</h2>${badges(state.magic.invocations)}</div><div class="panel card"><h2>Cantrips</h2>${badges(state.magic.cantrips)}</div><div class="panel card"><h2>Spells</h2>${badges(state.magic.spells)}</div>`;
  p.appendChild(lists);
  const n=el('div','panel card'); n.innerHTML=`<h2>Magic Notes</h2><textarea id="magicNotes">${state.magic.notes}</textarea>`; p.appendChild(n);
  n.querySelector('textarea').oninput=e=>{state.magic.notes=e.target.value; save();};
}
function renderInventory(){
  const p=page('inventory');
  const cur=el('div','panel card'); cur.innerHTML='<h2>Currency</h2><div class="grid grid-4">'+Object.keys(state.inventory.currency).map(k=>`<label>${k}<input type="number" data-cur="${k}" value="${state.inventory.currency[k]}"></label>`).join('')+'</div>'; p.appendChild(cur);
  cur.querySelectorAll('input').forEach(i=>i.oninput=e=>{state.inventory.currency[e.target.dataset.cur]=Number(e.target.value); save();});
  const inv=el('div','panel card'); inv.innerHTML='<h2>Inventory</h2>'+table(['Category','Item','Qty','Notes'], state.inventory.items.map(i=>[i.category,i.name,i.qty,i.notes]))+`<div class="small-form"><select id="cat"><option>Equipment</option><option>Weapon</option><option>Armor</option><option>Magic Item</option><option>Consumable</option><option>Quest Item</option><option>Valuables</option><option>Miscellaneous</option></select><input id="qty" type="number" value="1"><input id="itemName" placeholder="Item name"><button id="addItem">Add</button></div>`; p.appendChild(inv);
  inv.querySelector('#addItem').onclick=()=>{const name=inv.querySelector('#itemName').value.trim(); if(name) state.inventory.items.push({category:inv.querySelector('#cat').value,name,qty:Number(inv.querySelector('#qty').value)||1,notes:''}); render();};
}
function renderCharacter(){
  const p=page('character');
  const stats=Object.entries(state.character.stats).map(([k,v])=>[k,v,signed(mod(v))]);
  p.innerHTML = `<div class="grid grid-2"><div class="panel card"><h2>Ability Scores</h2>${table(['Stat','Score','Mod'],stats)}<p class="hint">CHA is currently cursed: base 20, current 19.</p></div><div class="panel card"><h2>Proficiencies</h2><h3>Saving Throws</h3>${badges(state.character.saves)}<h3>Skills</h3>${badges(state.character.skills)}<h3>Languages</h3>${badges(state.character.languages)}</div></div><div class="panel card"><h2>Background</h2><textarea id="charNotes" placeholder="Character notes, backstory, curse notes…">${state.notes}</textarea></div>`;
  p.querySelector('#charNotes').oninput=e=>{state.notes=e.target.value; save();};
}
function renderQuests(){
  const p=page('quests');
  p.innerHTML='<div class="panel card"><h2>Quests</h2>'+table(['Type','Status','Title','Progress'],state.quests.map(q=>[q.type,q.status,q.title,q.progress]))+`<div class="form-row"><input id="questTitle" placeholder="Quest title"><select id="questType"><option>Main Quest</option><option>Side Quest</option><option>Personal Quest</option><option>Hidden Quest</option></select><button id="addQuest">Add</button></div></div>`;
  p.querySelector('#addQuest').onclick=()=>{const title=p.querySelector('#questTitle').value.trim(); if(title) state.quests.push({type:p.querySelector('#questType').value,status:'Active',title,progress:''}); render();};
}
function renderLibrary(){
  const p=page('library');
  p.innerHTML='<div class="panel card"><h2>Library Notes</h2><p class="hint">Player notes only. No unlock system, no DM-only spoilers.</p>'+table(['Category','Title','Note'],state.library.map(l=>[l.category,l.title,l.body]))+`<div class="form-row"><input id="libTitle" placeholder="Entry title"><select id="libCat"><option>NPC</option><option>Location</option><option>Faction</option><option>Enemy</option><option>Lore</option><option>Session Note</option></select><button id="addLib">Add</button></div></div>`;
  p.querySelector('#addLib').onclick=()=>{const title=p.querySelector('#libTitle').value.trim(); if(title) state.library.push({category:p.querySelector('#libCat').value,title,body:''}); render();};
}
function renderSettings(){
  const p=page('settings');
  p.innerHTML = `<div class="grid grid-2"><div class="panel card"><h2>Data</h2><p>Stored locally in this browser via localStorage.</p><div class="footer-actions"><button id="exportData">Export JSON</button><button id="importData">Import JSON</button><button id="resetData">Reset</button></div><textarea id="jsonBox" placeholder="Exported/imported JSON appears here."></textarea></div><div class="panel card"><h2>Long Rest / Short Rest</h2><p>Use these buttons to refill common resources. HP is not automatically healed yet.</p><div class="footer-actions"><button id="shortRest">Short Rest</button><button id="longRest">Long Rest</button></div><p class="dragon-mark">◇ DRAGON SYSTEM INTERFACE ◇</p></div></div>`;
  p.querySelector('#exportData').onclick=()=>{p.querySelector('#jsonBox').value=JSON.stringify(state,null,2);};
  p.querySelector('#importData').onclick=()=>{try{state=JSON.parse(p.querySelector('#jsonBox').value); render();}catch{alert('Invalid JSON');}};
  p.querySelector('#resetData').onclick=()=>{if(confirm('Reset tracker data?')){state=structuredClone(defaultState);render();}};
  p.querySelector('#shortRest').onclick=()=>{state.resources.pactSlots=state.resources.pactSlotsMax; render();};
  p.querySelector('#longRest').onclick=()=>{state.resources.pactSlots=state.resources.pactSlotsMax; state.resources.spellSlots1=state.resources.spellSlots1Max; state.resources.layOnHands=state.resources.layOnHandsMax; state.resources.divineSense=state.resources.divineSenseMax; state.combat.conditions=[]; state.combat.concentration=false; state.combat.hex=false; render();};
}
function table(head, rows){ return `<table class="table"><thead><tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`; }
function badges(arr){ return `<p>${arr.map(x=>`<span class="badge">${x}</span>`).join('')}</p>`; }

initNav(); render(); showPage('status');
