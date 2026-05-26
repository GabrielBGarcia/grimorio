/* ═══════════════════════════════════════
   GRIMÓRIO — inventory.js
   Inventário, moedas, talentos, resistências, idiomas, proficiências
   ═══════════════════════════════════════ */

function buildInventory(char) {
  const list = document.getElementById('inv-list');
  if (!list) return;
  list.innerHTML = '';

  (char.inventory || []).forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'inv-item';
    div.innerHTML = `
      <div class="inv-qty">${item.qty}x</div>
      <div class="inv-name">${sanitizeText(item.name)}</div>
      <div class="inv-wt">${item.weight ? item.weight + 'kg' : ''}</div>
      <button class="rm-btn" onclick="removeItem(${idx})" aria-label="Remover ${item.name}">✕</button>`;
    list.appendChild(div);
  });
}

function searchItems(query) {
  const dropdown = document.getElementById('item-dropdown');
  if (!query) { dropdown.classList.remove('open'); return; }

  const homebrewItems = (homebrew.items || []).map(it => ({
    name: it.name, weight: it.weight, isHomebrew: true,
  }));
  const combined = [...SRD_ITEMS, ...homebrewItems];
  const results  = combined
    .filter(it => it.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 10);

  if (!results.length) { dropdown.classList.remove('open'); return; }

  dropdown.innerHTML = '';
  results.forEach(item => {
    const div = document.createElement('div');
    div.className = 'search-item';
    div.innerHTML = `
      <div class="search-item-name">${sanitizeText(item.name)}${item.isHomebrew ? ' ⚗' : ''}</div>
      <div class="search-item-sub">${item.weight ? item.weight + 'kg' : ''}</div>`;
    div.onclick = () => {
      quickAddItem({ name: item.name, qty: 1, weight: item.weight || '' });
      document.getElementById('item-search').value = '';
      dropdown.classList.remove('open');
    };
    dropdown.appendChild(div);
  });
  dropdown.classList.add('open');
}

function quickAddItem(item) {
  const char = getCurrentCharacter();
  if (!char) return;
  char.inventory = char.inventory || [];
  char.inventory.push(item);
  scheduleAutoSave();
  buildInventory(char);
  showToast(`${item.name} adicionado!`, 'success');
}

function openAddItemModal() {
  document.getElementById('it-name').value = '';
  document.getElementById('it-qty').value  = '1';
  document.getElementById('it-wt').value   = '';
  document.getElementById('it-desc').value = '';
  openModal('m-item');
}

function addItem() {
  const char = getCurrentCharacter();
  if (!char) return;
  const name = document.getElementById('it-name').value.trim();
  if (!name) return;
  char.inventory = char.inventory || [];
  char.inventory.push({
    name,
    qty:    +document.getElementById('it-qty').value  || 1,
    weight:  document.getElementById('it-wt').value   || '',
    desc:    document.getElementById('it-desc').value || '',
  });
  scheduleAutoSave();
  closeModal('m-item');
  buildInventory(char);
  showToast('Item adicionado!', 'success');
}

function removeItem(idx) {
  const char = getCurrentCharacter();
  if (!char) return;
  char.inventory.splice(idx, 1);
  scheduleAutoSave();
  buildInventory(char);
}

function buildFeats(char) {
  const list = document.getElementById('feats-list');
  if (!list) return;
  list.innerHTML = '';

  (char.feats || []).forEach((feat, idx) => {
    const div = document.createElement('div');
    div.className = 'feat-item';
    div.innerHTML = `
      <div style="flex:1">
        <div class="feat-name">${sanitizeText(feat.name)}</div>
        ${feat.desc ? `<div class="feat-desc">${sanitizeText(feat.desc)}</div>` : ''}
      </div>
      <button class="rm-btn" onclick="removeFeat(${idx})" aria-label="Remover talento ${feat.name}">✕</button>`;
    list.appendChild(div);
  });
}

function openAddFeatModal() {
  document.getElementById('ft-name').value = '';
  document.getElementById('ft-desc').value = '';
  openModal('m-feat');
}

function addFeat() {
  const char = getCurrentCharacter();
  if (!char) return;
  const name = document.getElementById('ft-name').value.trim();
  if (!name) return;
  char.feats = char.feats || [];
  char.feats.push({ name, desc: document.getElementById('ft-desc').value });
  scheduleAutoSave();
  closeModal('m-feat');
  buildFeats(char);
  showToast('Talento adicionado!', 'success');
}

function removeFeat(idx) {
  const char = getCurrentCharacter();
  if (!char) return;
  char.feats.splice(idx, 1);
  scheduleAutoSave();
  buildFeats(char);
}

function buildResistances(char) {
  const area = document.getElementById('resist-area');
  if (!area) return;
  area.innerHTML = '';

  (char.resistances || []).forEach((resistance, idx) => {
    const tag = document.createElement('span');
    tag.className = `rtag ${resistance.type}`;
    tag.innerHTML = `${sanitizeText(resistance.damage)} <button onclick="removeResistance(${idx})" aria-label="Remover resistência a ${resistance.damage}" style="background:none;border:none;cursor:pointer;color:inherit;font-size:.65rem;padding:0;margin-left:2px">✕</button>`;
    area.appendChild(tag);
  });
}

function addResistance() {
  const damageName = prompt('Tipo de dano (ex: Fogo):');
  if (!damageName) return;
  const resistanceType = prompt('Tipo (resist/immune/vuln):', 'resist');
  const char = getCurrentCharacter();
  if (!char) return;
  char.resistances = char.resistances || [];
  char.resistances.push({ damage: damageName.trim(), type: (resistanceType || 'resist').trim() });
  scheduleAutoSave();
  buildResistances(char);
}

function removeResistance(idx) {
  const char = getCurrentCharacter();
  if (!char) return;
  char.resistances.splice(idx, 1);
  scheduleAutoSave();
  buildResistances(char);
}

function buildLanguages(char) {
  const area = document.getElementById('lang-area');
  if (!area) return;
  area.innerHTML = '';

  (char.languages || []).forEach((lang, idx) => {
    const tag = document.createElement('span');
    tag.className = 'lang-tag';
    tag.innerHTML = `${sanitizeText(lang)} <button onclick="removeLanguage(${idx})" aria-label="Remover idioma ${lang}" style="background:none;border:none;cursor:pointer;color:var(--text-dim);font-size:.65rem;padding:0">✕</button>`;
    area.appendChild(tag);
  });
}

function addLanguage() {
  const lang = prompt('Idioma:');
  if (!lang) return;
  const char = getCurrentCharacter();
  if (!char) return;
  char.languages = char.languages || [];
  char.languages.push(lang.trim());
  scheduleAutoSave();
  buildLanguages(char);
}

function removeLanguage(idx) {
  const char = getCurrentCharacter();
  if (!char) return;
  char.languages.splice(idx, 1);
  scheduleAutoSave();
  buildLanguages(char);
}

function buildProficiencies(char) {
  const list = document.getElementById('prof-list');
  if (!list) return;
  list.innerHTML = '';

  (char.proficiencies || []).forEach((prof, idx) => {
    const div = document.createElement('div');
    div.className = 'skill-row';
    div.style.paddingTop = '.2rem';
    div.innerHTML = `
      <span style="font-size:.75rem;color:var(--text-dim);margin-right:4px">⚔</span>
      <span style="flex:1;font-size:.78rem">${sanitizeText(prof)}</span>
      <button class="rm-btn" onclick="removeProficiency(${idx})" aria-label="Remover proficiência ${prof}">✕</button>`;
    list.appendChild(div);
  });
}

function addProficiency() {
  const prof = prompt('Proficiência:');
  if (!prof) return;
  const char = getCurrentCharacter();
  if (!char) return;
  char.proficiencies = char.proficiencies || [];
  char.proficiencies.push(prof.trim());
  scheduleAutoSave();
  buildProficiencies(char);
}

function removeProficiency(idx) {
  const char = getCurrentCharacter();
  if (!char) return;
  char.proficiencies.splice(idx, 1);
  scheduleAutoSave();
  buildProficiencies(char);
}
