/* ═══════════════════════════════════════
   GRIMÓRIO — spells.js
   Magias e espaços de magia
   ═══════════════════════════════════════ */

function buildSpellSlots(char) {
  const grid = document.getElementById('spell-slots');
  if (!grid) return;
  grid.innerHTML = '';

  const level     = Math.min(20, char.level || 1);
  const defaults  = SPELL_SLOT_TABLE[level] || [];
  char.spellSlots = char.spellSlots || {};

  for (let i = 1; i <= 9; i++) {
    const maxSlots = defaults[i - 1] || 0;
    if (!char.spellSlots[i]) char.spellSlots[i] = { max: maxSlots, used: 0 };

    const slot = char.spellSlots[i];
    const cell = document.createElement('div');
    cell.className = 'slot-cell';

    let pipsHTML = '';
    for (let p = 0; p < slot.max; p++) {
      const isAvailable = p < (slot.max - slot.used);
      pipsHTML += `<div class="slot-pip ${isAvailable ? 'avail' : 'used'}"
                        onclick="toggleSpellSlot(${i}, ${p})"
                        aria-label="Espaço ${p + 1} de nível ${i}: ${isAvailable ? 'disponível' : 'usado'}"></div>`;
    }
    cell.innerHTML = `<div class="slot-lv">${i}º</div><div class="slot-pips">${pipsHTML || '—'}</div>`;
    grid.appendChild(cell);
  }
}

function toggleSpellSlot(level, pipIndex) {
  const char = getCurrentCharacter();
  if (!char) return;
  char.spellSlots = char.spellSlots || {};
  const slot      = char.spellSlots[level] || { max: 0, used: 0 };
  const available = slot.max - slot.used;

  if (pipIndex < available) slot.used++;
  else if (slot.used > 0)   slot.used--;

  char.spellSlots[level] = slot;
  scheduleAutoSave();
  buildSpellSlots(char);
}

function buildSpellList(char) {
  const list = document.getElementById('spell-list');
  if (!list) return;
  list.innerHTML = '';

  (char.spells || []).forEach((spell, idx) => {
    const div = document.createElement('div');
    div.className = 'spell-item';
    div.innerHTML = `
      <div class="spell-badge">${spell.level === 0 ? 'Truque' : `Nv ${spell.level}`}</div>
      <div class="spell-name-txt">${sanitizeText(spell.name)}</div>
      <div class="spell-school-txt">${sanitizeText(spell.school || '')}</div>
      <button class="rm-btn" onclick="removeSpell(${idx})" aria-label="Remover ${spell.name}">✕</button>`;
    list.appendChild(div);
  });
}

function searchSpells(query) {
  const dropdown = document.getElementById('spell-dropdown');
  if (!query) { dropdown.classList.remove('open'); return; }

  const homebrewSpells = (homebrew.spells || []).map(s => ({
    name: s.name, level: +s.level, school: s.school, isHomebrew: true,
  }));
  const combined = [...SRD_SPELLS, ...homebrewSpells];
  const results  = combined
    .filter(s => s.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 10);

  if (!results.length) { dropdown.classList.remove('open'); return; }

  dropdown.innerHTML = '';
  results.forEach(spell => {
    const div = document.createElement('div');
    div.className = 'search-item';
    div.innerHTML = `
      <div class="search-item-badge">${spell.level === 0 ? 'Truque' : `Nv ${spell.level}`}</div>
      <div class="search-item-name">${sanitizeText(spell.name)}${spell.isHomebrew ? ' ⚗' : ''}</div>
      <div class="search-item-sub">${sanitizeText(spell.school || '')}</div>`;
    div.onclick = () => {
      quickAddSpell({ name: spell.name, level: spell.level, school: spell.school || '' });
      document.getElementById('spell-search').value = '';
      dropdown.classList.remove('open');
    };
    dropdown.appendChild(div);
  });
  dropdown.classList.add('open');
}

function quickAddSpell(spell) {
  const char = getCurrentCharacter();
  if (!char) return;
  char.spells = char.spells || [];
  if (char.spells.find(s => s.name === spell.name)) {
    showToast('Magia já adicionada', 'info');
    return;
  }
  char.spells.push(spell);
  scheduleAutoSave();
  buildSpellList(char);
  showToast(`${spell.name} adicionada!`, 'success');
}

function openAddSpellModal() {
  document.getElementById('sp-name').value = '';
  document.getElementById('sp-desc').value = '';
  openModal('m-spell');
}

function addSpell() {
  const char = getCurrentCharacter();
  if (!char) return;
  const name = document.getElementById('sp-name').value.trim();
  if (!name) return;
  char.spells = char.spells || [];
  char.spells.push({
    name,
    level:      +document.getElementById('sp-level').value  || 0,
    school:      document.getElementById('sp-school').value || '',
    components:  document.getElementById('sp-comp').value   || '',
    desc:        document.getElementById('sp-desc').value   || '',
  });
  scheduleAutoSave();
  closeModal('m-spell');
  buildSpellList(char);
  showToast('Magia adicionada!', 'success');
}

function removeSpell(idx) {
  const char = getCurrentCharacter();
  if (!char) return;
  char.spells.splice(idx, 1);
  scheduleAutoSave();
  buildSpellList(char);
}
