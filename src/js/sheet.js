/* ═══════════════════════════════════════
   GRIMÓRIO — sheet.js
   Renderização da ficha de personagem
   ═══════════════════════════════════════ */

function refreshSheet() {
  const char = getCurrentCharacter();
  if (!char) return;

  buildAttributes(char);
  buildSavingThrows(char);
  buildCombatStats(char);
  buildSkills(char);
  buildConditions(char);
  buildSpellSlots(char);
  buildSpellList(char);
  buildInventory(char);
  buildFeats(char);
  buildResistances(char);
  buildLanguages(char);
  buildProficiencies(char);
  fillIdentityFields(char);
  fillHPFields(char);
  fillTextareas(char);
  fillCoinFields(char);
  fillPortrait(char);
  fillExtraImages(char);
  fillRightPanel(char);
}

function fillIdentityFields(char) {
  ['name', 'race', 'class', 'subclass', 'background', 'alignment'].forEach(key => {
    const el = document.getElementById('char-' + key);
    if (el) el.value = char[key] || '';
  });
  document.getElementById('char-level').value = char.level || 1;
  document.getElementById('char-xp').value    = char.xp    || 0;
  document.getElementById('char-age').value   = char.age   || '';
}

function fillTextareas(char) {
  ['personality', 'ideals', 'bonds', 'flaws', 'backstory'].forEach(key => {
    const el = document.getElementById('bg-' + key);
    if (el) el.value = char[key] || '';
  });
  const notesEl = document.getElementById('notes-txt');
  const equipEl = document.getElementById('equip-txt');
  if (notesEl) notesEl.value = char.notes     || '';
  if (equipEl) equipEl.value = char.equipment || '';
}

function fillCoinFields(char) {
  ['pp', 'gp', 'ep', 'sp', 'cp'].forEach(key => {
    const el = document.getElementById('coin-' + key);
    if (el) el.value = (char.coins || {})[key] || 0;
  });
}

function fillRightPanel(char) {
  const initEl  = document.getElementById('init-display');
  const turnEl  = document.getElementById('turn-num');
  const hdUsed  = document.getElementById('hd-used');
  const hdMax   = document.getElementById('hd-max');
  const hdType  = document.getElementById('hd-type');
  const pbEl    = document.getElementById('pb-display');
  const inspBtn = document.getElementById('insp-btn');

  if (initEl)  initEl.value       = char.initiative  || 0;
  if (turnEl)  turnEl.textContent = char.turnCount    || 1;
  if (hdUsed)  hdUsed.value       = char.hitDiceUsed  || 0;
  if (hdMax)   hdMax.textContent  = char.level        || 1;
  if (hdType)  hdType.value       = char.hitDiceType  || 'd8';
  if (pbEl)    pbEl.textContent   = '+' + (char.profBonus || 2);

  if (inspBtn) {
    inspBtn.classList.toggle('on', char.inspiration);
    inspBtn.textContent = char.inspiration ? '✦ INSPIRADO!' : '✦ SEM INSPIRAÇÃO';
  }

  const saves = char.deathSaves || { success: [false,false,false], failure: [false,false,false] };
  document.querySelectorAll('.dsave-pip').forEach(el => {
    el.classList.toggle('on', saves[el.dataset.t]?.[+el.dataset.i] ?? false);
  });
}

function buildAttributes(char) {
  const grid = document.getElementById('attrs-grid');
  if (!grid) return;
  grid.innerHTML = '';

  ATTRS.forEach(attrKey => {
    const value    = (char.attrs || {})[attrKey] || 10;
    const modifier = getModifier(value);
    const box      = document.createElement('div');
    box.className  = 'attr-box';
    box.id         = 'ab-' + attrKey;

    box.innerHTML = `
      <div class="attr-lbl">${ATTR_LABELS[attrKey]}</div>
      <div class="attr-mod" id="am-${attrKey}">${formatModifier(value)}</div>
      <div class="attr-row">
        <button class="attr-btn" onclick="adjustAttribute('${attrKey}', -1)" aria-label="Diminuir ${ATTR_LABELS[attrKey]}">−</button>
        <input type="number" class="attr-num" id="an-${attrKey}" value="${value}" min="1" max="30"
               aria-label="${ATTR_LABELS[attrKey]}"
               onchange="setAttributeValue('${attrKey}', +this.value)">
        <button class="attr-btn" onclick="adjustAttribute('${attrKey}', 1)" aria-label="Aumentar ${ATTR_LABELS[attrKey]}">+</button>
      </div>
      <div class="attr-st" id="ast-${attrKey}">
        <div class="pdot ${(char.stProfs || []).includes(attrKey) ? 'on' : ''}"
             onclick="toggleSavingThrow('${attrKey}', this)"
             aria-label="Proficiência em salvaguarda de ${ATTR_LABELS[attrKey]}"></div>
        <span id="stv-${attrKey}"></span>
      </div>`;
    grid.appendChild(box);
  });

  recalcDerived();
}

function getModifier(value) {
  return Math.floor((value - 10) / 2);
}

function formatModifier(value) {
  const mod = getModifier(value);
  return (mod >= 0 ? '+' : '') + mod;
}

function getProficiencyBonus(char) {
  return char.profBonus || Math.ceil((char.level || 1) / 4) + 1;
}

function adjustAttribute(attrKey, delta) {
  const char = getCurrentCharacter();
  if (!char) return;

  const current = (char.attrs || {})[attrKey] || 10;
  let newValue  = Math.max(1, Math.min(30, current + delta));

  if (isPointBuyMode) {
    newValue = Math.max(8, Math.min(15, newValue));
    const cost  = POINT_BUY_COST[newValue] || 0;
    const spent = ATTRS.reduce((sum, key) => {
      return sum + (key === attrKey ? 0 : (POINT_BUY_COST[(char.attrs || {})[key] || 8] || 0));
    }, 0);
    if (cost + spent > 27) return;
  }

  char.attrs[attrKey] = newValue;
  const input = document.getElementById('an-' + attrKey);
  if (input) input.value = newValue;
  const box = document.getElementById('ab-' + attrKey);
  if (box) { box.classList.remove('bump'); void box.offsetWidth; box.classList.add('bump'); }

  scheduleAutoSave();
  recalcDerived();
  updatePointBuyBanner();
}

function setAttributeValue(attrKey, value) {
  const char = getCurrentCharacter();
  if (!char) return;
  char.attrs[attrKey] = Math.max(1, Math.min(30, value || 10));
  scheduleAutoSave();
  recalcDerived();
  updatePointBuyBanner();
}

function toggleSavingThrow(attrKey, dotEl) {
  const char = getCurrentCharacter();
  if (!char) return;
  char.stProfs = char.stProfs || [];
  const idx = char.stProfs.indexOf(attrKey);
  if (idx >= 0) char.stProfs.splice(idx, 1);
  else char.stProfs.push(attrKey);
  dotEl.classList.toggle('on', char.stProfs.includes(attrKey));
  scheduleAutoSave();
  recalcDerived();
}

function recalcDerived() {
  const char = getCurrentCharacter();
  if (!char) return;
  const profBonus = getProficiencyBonus(char);

  ATTRS.forEach(key => {
    const value    = (char.attrs || {})[key] || 10;
    const modifier = getModifier(value);
    const modEl    = document.getElementById('am-' + key);
    if (modEl) modEl.textContent = formatModifier(value);

    const hasProficiency = (char.stProfs || []).includes(key);
    const stTotal        = modifier + (hasProficiency ? profBonus : 0);
    const stEl           = document.getElementById('stv-' + key);
    if (stEl) stEl.textContent = (stTotal >= 0 ? '+' : '') + stTotal + ' ST';
  });

  buildSavingThrows(char);
  buildSkills(char);
  buildCombatStats(char);

  const pbEl = document.getElementById('pb-display');
  if (pbEl) pbEl.textContent = '+' + (char.profBonus || 2);
}

function buildSavingThrows(char) {
  const list = document.getElementById('st-list');
  if (!list) return;
  const profBonus = getProficiencyBonus(char);
  list.innerHTML = '';

  ATTRS.forEach(key => {
    const value      = (char.attrs || {})[key] || 10;
    const modifier   = getModifier(value);
    const hasProf    = (char.stProfs || []).includes(key);
    const total      = modifier + (hasProf ? profBonus : 0);
    const row        = document.createElement('div');
    row.className    = 'skill-row';
    row.innerHTML    = `
      <div class="pdot ${hasProf ? 'on' : ''}"
           onclick="toggleSavingThrow('${key}', this)"
           aria-label="Proficiência em ${ATTR_LABELS[key]}"></div>
      <div class="skill-name">${ATTR_LABELS[key]}</div>
      <div class="skill-bonus">${total >= 0 ? '+' : ''}${total}</div>`;
    list.appendChild(row);
  });
}

function buildSkills(char) {
  const grid = document.getElementById('skills-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const profBonus = getProficiencyBonus(char);

  SKILLS.forEach(skill => {
    const value      = (char.attrs || {})[skill.attr] || 10;
    const modifier   = getModifier(value);
    const hasProf    = (char.skillProfs   || []).includes(skill.name);
    const hasExpert  = (char.expertSkills || []).includes(skill.name);
    const bonus      = modifier + (hasProf ? profBonus : 0) + (hasExpert ? profBonus : 0);
    const row        = document.createElement('div');
    row.className    = 'skill-row';
    row.innerHTML    = `
      <div class="pdot ${hasProf || hasExpert ? 'on' : ''}"
           style="${hasExpert ? 'background:var(--gold);' : ''}border-color:${hasExpert ? 'var(--gold)' : 'var(--gold-dim)'}"
           onclick="cycleSkillProficiency('${skill.name}', this)"
           title="${hasExpert ? 'Expertise' : hasProf ? 'Proficiente' : ''}"
           aria-label="${skill.name}: ${hasExpert ? 'expertise' : hasProf ? 'proficiente' : 'sem proficiência'}"></div>
      <div class="skill-name" title="${skill.attr.toUpperCase()}">${skill.name}</div>
      <div class="skill-bonus">${bonus >= 0 ? '+' : ''}${bonus}</div>`;
    grid.appendChild(row);
  });
}

function cycleSkillProficiency(skillName, dotEl) {
  const char = getCurrentCharacter();
  if (!char) return;
  char.skillProfs   = char.skillProfs   || [];
  char.expertSkills = char.expertSkills || [];
  const hasProf   = char.skillProfs.includes(skillName);
  const hasExpert = char.expertSkills.includes(skillName);

  if (!hasProf && !hasExpert) {
    char.skillProfs.push(skillName);
  } else if (hasProf && !hasExpert) {
    char.expertSkills.push(skillName);
  } else {
    char.skillProfs   = char.skillProfs.filter(s => s !== skillName);
    char.expertSkills = char.expertSkills.filter(s => s !== skillName);
  }
  scheduleAutoSave();
  buildSkills(char);
}

function buildCombatStats(char) {
  const row = document.getElementById('combat-row');
  if (!row) return;
  const passivePerception = 10
    + getModifier((char.attrs || {}).wis || 10)
    + ((char.skillProfs || []).includes('Percepção') ? getProficiencyBonus(char) : 0);

  const stats = [
    { id: 'ac',    label: 'CA',            field: 'ac',        default: 10 },
    { id: 'speed', label: 'Deslocamento',  field: 'speed',     default: 30 },
    { id: 'pb',    label: 'Proficiência',  field: 'profBonus', default: 2  },
    { id: 'pp',    label: 'Perc. Passiva', readOnly: true, value: passivePerception },
  ];

  row.innerHTML = '';
  stats.forEach(stat => {
    const value = stat.readOnly ? stat.value : (char[stat.field] || stat.default);
    const div   = document.createElement('div');
    div.className = 'combat-stat';
    if (stat.readOnly) {
      div.innerHTML = `<div class="cs-lbl">${stat.label}</div><div class="cs-num">${value}</div>`;
    } else {
      div.innerHTML = `
        <div class="cs-lbl">${stat.label}</div>
        <div class="cs-val">
          <button class="cs-btn" onclick="adjustNumericField('${stat.field}', -1)" aria-label="Diminuir ${stat.label}">−</button>
          <input type="number" class="cs-ninput" id="csf-${stat.id}" value="${value}"
                 aria-label="${stat.label}"
                 onchange="setField('${stat.field}', +this.value); buildCombatStats(getCurrentCharacter()); refreshProfDisplay()">
          <button class="cs-btn" onclick="adjustNumericField('${stat.field}', 1)" aria-label="Aumentar ${stat.label}">+</button>
        </div>`;
    }
    row.appendChild(div);
  });
}

function adjustNumericField(fieldName, delta) {
  const char = getCurrentCharacter();
  if (!char) return;
  char[fieldName] = (char[fieldName] || 0) + delta;
  scheduleAutoSave();
}

function refreshProfDisplay() {
  const char = getCurrentCharacter();
  if (!char) return;
  const el = document.getElementById('pb-display');
  if (el) el.textContent = '+' + (char.profBonus || 2);
  recalcDerived();
}

function fillHPFields(char) {
  document.getElementById('hp-cur').value = char.hp.current || 0;
  document.getElementById('hp-max').value = char.hp.max     || 10;
  document.getElementById('hp-tmp').value = char.hp.temp    || 0;
  updateHPBar(char);
}

function updateHP() {
  const char = getCurrentCharacter();
  if (!char) return;
  char.hp.current = +document.getElementById('hp-cur').value || 0;
  char.hp.max     = +document.getElementById('hp-max').value || 1;
  char.hp.temp    = +document.getElementById('hp-tmp').value || 0;
  scheduleAutoSave();
  updateHPBar(char);
}

function updateHPBar(char) {
  const max    = char.hp.max || 1;
  const current = Math.max(0, char.hp.current);
  const percent = Math.max(0, Math.min(100, (current / max) * 100));

  const fillEl   = document.getElementById('hp-fill');
  const labelEl  = document.getElementById('hp-label');
  const statusEl = document.getElementById('hp-status');

  let barColor, statusText, statusStyle;

  if (current <= 0) {
    barColor    = '#3a0000';
    statusText  = '💀 INCONSCIENTE';
    statusStyle = 'background:rgba(60,0,0,.3);color:#ff5555;border:1px solid #5a1a1a';
  } else if (percent <= 25) {
    barColor    = '#7a1a1a';
    statusText  = '⚠ CRÍTICO';
    statusStyle = 'background:rgba(100,0,0,.2);color:#ff7777;border:1px solid var(--blood)';
  } else if (percent <= 60) {
    barColor    = '#8a6a1a';
    statusText  = '⚡ FERIDO';
    statusStyle = 'background:rgba(120,90,0,.15);color:#ffc055;border:1px solid #7a5a14';
  } else {
    barColor    = '#2d6e4e';
    statusText  = '✦ SAUDÁVEL';
    statusStyle = 'background:rgba(45,110,78,.1);color:#7bffb0;border:1px solid #1a5a3a';
  }

  if (fillEl)  { fillEl.style.width = percent + '%'; fillEl.style.background = barColor; }
  if (labelEl)  labelEl.textContent = `${current} / ${max}${char.hp.temp ? ` (+${char.hp.temp})` : ''}`;
  if (statusEl) {
    statusEl.textContent = statusText;
    statusEl.style.cssText = statusStyle + ';font-family:Cinzel,serif;font-size:.62rem;letter-spacing:.12em;text-align:center;padding:.2rem;border-radius:3px;margin-top:.35rem;';
  }
}

function adjustCurrentHP(delta) {
  const char = getCurrentCharacter();
  if (!char) return;
  char.hp.current = Math.max(0, Math.min(char.hp.max, char.hp.current + delta));
  document.getElementById('hp-cur').value = char.hp.current;
  scheduleAutoSave();
  updateHPBar(char);
}
function adjustMaxHP(delta) {
  const char = getCurrentCharacter();
  if (!char) return;
  char.hp.max = Math.max(1, char.hp.max + delta);
  document.getElementById('hp-max').value = char.hp.max;
  scheduleAutoSave();
  updateHPBar(char);
}
function adjustTempHP(delta) {
  const char = getCurrentCharacter();
  if (!char) return;
  char.hp.temp = Math.max(0, char.hp.temp + delta);
  document.getElementById('hp-tmp').value = char.hp.temp;
  scheduleAutoSave();
  updateHPBar(char);
}

function applyDamage() {
  const char = getCurrentCharacter();
  if (!char) return;
  let amount = +document.getElementById('hp-val').value || 0;
  if (amount <= 0) return;
  if (char.hp.temp > 0) {
    const absorbed = Math.min(char.hp.temp, amount);
    char.hp.temp  -= absorbed;
    amount        -= absorbed;
  }
  char.hp.current = Math.max(0, char.hp.current - amount);
  document.getElementById('hp-cur').value = char.hp.current;
  document.getElementById('hp-tmp').value = char.hp.temp;
  document.getElementById('hp-val').value = '';
  scheduleAutoSave();
  updateHPBar(char);
  showToast(`${amount} de dano`, 'error');
}

function applyHeal() {
  const char   = getCurrentCharacter();
  if (!char) return;
  const amount = +document.getElementById('hp-val').value || 0;
  if (amount <= 0) return;
  char.hp.current = Math.min(char.hp.max, char.hp.current + amount);
  document.getElementById('hp-cur').value = char.hp.current;
  document.getElementById('hp-val').value = '';
  scheduleAutoSave();
  updateHPBar(char);
  showToast(`+${amount} HP curados`, 'success');
}

function applyTempHP() {
  const char   = getCurrentCharacter();
  if (!char) return;
  const amount = +document.getElementById('hp-val').value || 0;
  if (amount <= 0) return;
  char.hp.temp = Math.max(char.hp.temp, amount);
  document.getElementById('hp-tmp').value = char.hp.temp;
  document.getElementById('hp-val').value = '';
  scheduleAutoSave();
  updateHPBar(char);
  showToast(`+${amount} HP temporário`, 'info');
}

function togglePointBuy() {
  isPointBuyMode = !isPointBuyMode;
  const banner    = document.getElementById('pb-banner');
  const toggleBtn = document.getElementById('pb-toggle-btn');
  if (banner)    banner.style.display    = isPointBuyMode ? 'flex' : 'none';
  if (toggleBtn) toggleBtn.style.display = isPointBuyMode ? 'none' : 'block';
  updatePointBuyBanner();
}

function updatePointBuyBanner() {
  if (!isPointBuyMode) return;
  const char = getCurrentCharacter();
  if (!char) return;
  const spent  = ATTRS.reduce((sum, key) => sum + (POINT_BUY_COST[(char.attrs || {})[key] || 8] || 0), 0);
  const ptsEl  = document.getElementById('pb-pts');
  if (ptsEl) {
    ptsEl.textContent  = (27 - spent) + ' pts';
    ptsEl.style.color  = spent > 27 ? '#ff8888' : 'var(--gold)';
  }
}

function buildConditions(char) {
  const grid = document.getElementById('cond-grid');
  if (!grid) return;
  grid.innerHTML = '';

  CONDITIONS.forEach(conditionName => {
    const isActive = (char.conditions || []).includes(conditionName);
    const tag      = document.createElement('div');
    tag.className  = 'cond-tag' + (isActive ? ' on' : '');
    tag.textContent = conditionName;
    tag.setAttribute('aria-pressed', String(isActive));
    tag.onclick = () => {
      char.conditions = char.conditions || [];
      const idx = char.conditions.indexOf(conditionName);
      if (idx >= 0) char.conditions.splice(idx, 1);
      else          char.conditions.push(conditionName);
      const nowActive = char.conditions.includes(conditionName);
      tag.classList.toggle('on', nowActive);
      tag.setAttribute('aria-pressed', String(nowActive));
      scheduleAutoSave();
    };
    grid.appendChild(tag);
  });
}

function triggerPortraitUpload() {
  document.getElementById('portrait-input').click();
}

function loadPortraitFromInput(event) {
  const file = event.target.files[0];
  if (!file) return;
  compressImage(file, 400, 400, url => {
    const char = getCurrentCharacter();
    if (!char) return;
    char.portrait = url;
    scheduleAutoSave();
    fillPortrait(char);
    showToast('Retrato atualizado!', 'success');
  });
}

function fillPortrait(char) {
  const img = document.getElementById('portrait-img');
  const ph  = document.getElementById('portrait-ph');
  if (char.portrait) {
    if (img) { img.src = char.portrait; img.style.display = 'block'; }
    if (ph)  ph.style.display = 'none';
  } else {
    if (img) img.style.display = 'none';
    if (ph)  ph.style.display = 'flex';
  }
}

function triggerExtraImageUpload() {
  document.getElementById('extra-input').click();
}

function loadExtraImages(event) {
  const files = Array.from(event.target.files);
  const char  = getCurrentCharacter();
  if (!char) return;
  char.extraImages = char.extraImages || [];
  let done = 0;
  files.forEach(file => {
    compressImage(file, 600, 600, url => {
      char.extraImages.push(url);
      done++;
      if (done === files.length) {
        scheduleAutoSave();
        fillExtraImages(char);
      }
    });
  });
}

function fillExtraImages(char) {
  const container = document.getElementById('extra-thumbs');
  if (!container) return;
  container.innerHTML = '';

  (char.extraImages || []).forEach((src, idx) => {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative;width:55px;height:55px';

    const img = document.createElement('img');
    img.src   = src;
    img.alt   = `Imagem extra ${idx + 1}`;
    img.style.cssText = 'width:55px;height:55px;object-fit:cover;border-radius:3px;border:1px solid var(--border);cursor:pointer';
    img.onclick = () => window.open(src, '_blank');

    const removeBtn = document.createElement('button');
    removeBtn.textContent   = '✕';
    removeBtn.setAttribute('aria-label', `Remover imagem ${idx + 1}`);
    removeBtn.style.cssText = 'position:absolute;top:-3px;right:-3px;background:var(--blood);border:none;color:white;border-radius:50%;width:14px;height:14px;font-size:.55rem;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;line-height:1';
    removeBtn.onclick = () => {
      char.extraImages.splice(idx, 1);
      scheduleAutoSave();
      fillExtraImages(char);
    };

    wrapper.appendChild(img);
    wrapper.appendChild(removeBtn);
    container.appendChild(wrapper);
  });
}

function onDragOver(event)  { event.preventDefault(); document.getElementById('extra-drop').classList.add('drag-over'); }
function onDragLeave()      { document.getElementById('extra-drop').classList.remove('drag-over'); }
function onDropImages(event) {
  event.preventDefault();
  document.getElementById('extra-drop').classList.remove('drag-over');
  const files = Array.from(event.dataTransfer.files).filter(f => f.type.startsWith('image/'));
  if (!files.length) return;
  const char = getCurrentCharacter();
  if (!char) return;
  char.extraImages = char.extraImages || [];
  let done = 0;
  files.forEach(file => {
    compressImage(file, 600, 600, url => {
      char.extraImages.push(url);
      done++;
      if (done === files.length) {
        scheduleAutoSave();
        fillExtraImages(char);
        showToast('Imagem adicionada!', 'success');
      }
    });
  });
}

function compressImage(file, maxWidth, maxHeight, callback) {
  const reader = new FileReader();
  reader.onload = e => {
    const img   = new Image();
    img.onload  = () => {
      const ratio  = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width  = img.width  * ratio;
      canvas.height = img.height * ratio;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      callback(canvas.toDataURL('image/jpeg', 0.75));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function switchTab(tabName, btnEl) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('on'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('on'));
  document.getElementById('tab-' + tabName).classList.add('on');
  if (btnEl) btnEl.classList.add('on');
}
