/* ═══════════════════════════════════════
   GRIMÓRIO — homebrew.js
   Gerenciador de conteúdo homebrew
   ═══════════════════════════════════════ */

function openHomebrewManager() {
  renderHomebrewLists();
  openModal('m-homebrew');
}

function switchHomebrewTab(tabName, btnEl) {
  document.querySelectorAll('.hb-pane').forEach(p => p.classList.remove('on'));
  document.querySelectorAll('.hb-tab').forEach(b => b.classList.remove('on'));
  document.getElementById('hb-' + tabName).classList.add('on');
  if (btnEl) btnEl.classList.add('on');
}

function addHomebrewRace() {
  const name = document.getElementById('hb-race-name').value.trim();
  if (!name) return;
  homebrew.races.push({
    name,
    bonus:  document.getElementById('hb-race-bonus').value  || '',
    traits: document.getElementById('hb-race-traits').value || '',
  });
  saveHomebrew();
  refreshDataLists();
  renderHomebrewLists();
  document.getElementById('hb-race-name').value   = '';
  document.getElementById('hb-race-bonus').value  = '';
  document.getElementById('hb-race-traits').value = '';
  showToast('Raça adicionada!', 'success');
}

function addHomebrewClass() {
  const name = document.getElementById('hb-class-name').value.trim();
  if (!name) return;
  homebrew.classes.push({
    name,
    hd:   document.getElementById('hb-class-hd').value   || '',
    desc: document.getElementById('hb-class-desc').value || '',
  });
  saveHomebrew();
  refreshDataLists();
  renderHomebrewLists();
  document.getElementById('hb-class-name').value = '';
  document.getElementById('hb-class-hd').value   = '';
  document.getElementById('hb-class-desc').value = '';
  showToast('Classe adicionada!', 'success');
}

function addHomebrewSpell() {
  const name = document.getElementById('hb-spell-name').value.trim();
  if (!name) return;
  homebrew.spells.push({
    name,
    level:  document.getElementById('hb-spell-level').value  || '0',
    school: document.getElementById('hb-spell-school').value || '',
    desc:   document.getElementById('hb-spell-desc').value   || '',
  });
  saveHomebrew();
  renderHomebrewLists();
  document.getElementById('hb-spell-name').value = '';
  document.getElementById('hb-spell-desc').value = '';
  showToast('Magia homebrew adicionada!', 'success');
}

function addHomebrewItem() {
  const name = document.getElementById('hb-item-name').value.trim();
  if (!name) return;
  homebrew.items.push({
    name,
    weight: document.getElementById('hb-item-wt').value   || '',
    desc:   document.getElementById('hb-item-desc').value || '',
  });
  saveHomebrew();
  renderHomebrewLists();
  document.getElementById('hb-item-name').value = '';
  document.getElementById('hb-item-wt').value   = '';
  document.getElementById('hb-item-desc').value = '';
  showToast('Item homebrew adicionado!', 'success');
}

function removeHomebrew(collectionType, idx) {
  homebrew[collectionType].splice(idx, 1);
  saveHomebrew();
  refreshDataLists();
  renderHomebrewLists();
}

function renderHomebrewLists() {
  ['races', 'classes', 'spells', 'items'].forEach(type => {
    const list = document.getElementById('hb-' + type + '-list');
    if (!list) return;
    list.innerHTML = '';

    homebrew[type].forEach((entry, idx) => {
      const div = document.createElement('div');
      div.className = 'hb-item';
      div.innerHTML = `
        <div style="flex:1">
          <div class="hb-item-name">${sanitizeText(entry.name)}</div>
          <div class="hb-item-sub">${sanitizeText(entry.bonus || entry.hd || entry.school || entry.weight || '')}</div>
        </div>
        <button class="rm-btn" onclick="removeHomebrew('${type}', ${idx})" aria-label="Remover ${entry.name}">✕</button>`;
      list.appendChild(div);
    });
  });
}

function refreshDataLists() {
  const racesDatalist   = document.getElementById('dl-races');
  const classesDatalist = document.getElementById('dl-classes');

  if (racesDatalist) {
    racesDatalist.innerHTML = '';
    [...SRD_RACES, ...(homebrew.races || []).map(r => r.name)].forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      racesDatalist.appendChild(option);
    });
  }

  if (classesDatalist) {
    classesDatalist.innerHTML = '';
    [...SRD_CLASSES, ...(homebrew.classes || []).map(c => c.name)].forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      classesDatalist.appendChild(option);
    });
  }
}
