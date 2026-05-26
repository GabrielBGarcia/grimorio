/* ═══════════════════════════════════════
   GRIMÓRIO — data.js
   Persistência, schema de personagem e migrações
   ═══════════════════════════════════════ */

const SCHEMA_VERSION = 1;
const STORAGE_KEY_CHARS    = 'grim_chars';
const STORAGE_KEY_HOMEBREW = 'grim_homebrew';

// ── Estado global da aplicação ────────────────────────────────
let characters  = [];
let currentId   = null;
let undoStack   = [];
let autoSaveTimer = null;
let isPointBuyMode = false;

// Homebrew collections
let homebrew = { races: [], classes: [], spells: [], items: [] };

// ── Migração de schema ────────────────────────────────────────
function migrateCharacter(char) {
  if (!char.schemaVersion || char.schemaVersion < 1) {
    char.coins       = char.coins       || { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 };
    char.conditions  = char.conditions  || [];
    char.extraImages = char.extraImages || [];
    char.turnCount   = char.turnCount   || 1;
    char.feats       = char.feats       || [];
    char.resistances = char.resistances || [];
    char.languages   = char.languages   || [];
    char.proficiencies = char.proficiencies || [];
    char.deathSaves  = char.deathSaves  || {
      success: [false, false, false],
      failure: [false, false, false],
    };
    char.schemaVersion = 1;
  }
  return char;
}

// ── Criação de personagem padrão ──────────────────────────────
function createDefaultCharacter(
  name      = 'Aventureiro',
  charClass = 'Guerreiro',
  race      = 'Humano',
  level     = 1,
  alignment = ''
) {
  return {
    id:           Date.now() + '_' + Math.random().toString(36).slice(2),
    schemaVersion: SCHEMA_VERSION,
    name,
    race,
    class:        charClass,
    subclass:     '',
    background:   '',
    alignment,
    level,
    xp:           0,
    age:          '',
    height:       '',
    weight:       '',
    attrs:        { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    profBonus:    Math.ceil(level / 4) + 1,
    stProfs:      [],
    skillProfs:   [],
    expertSkills: [],
    hp:           { current: 10, max: 10, temp: 0 },
    ac:           10,
    initiative:   0,
    speed:        30,
    hitDiceUsed:  0,
    hitDiceType:  'd8',
    deathSaves:   { success: [false, false, false], failure: [false, false, false] },
    inspiration:  false,
    spells:       [],
    spellSlots:   {},
    inventory:    [],
    equipment:    '',
    coins:        { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 },
    feats:        [],
    resistances:  [],
    languages:    [],
    proficiencies:[],
    personality:  '',
    ideals:       '',
    bonds:        '',
    flaws:        '',
    backstory:    '',
    conditions:   [],
    notes:        '',
    portrait:     '',
    extraImages:  [],
    turnCount:    1,
  };
}

// ── Persistência ──────────────────────────────────────────────
function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHARS);
    characters = (JSON.parse(raw || '[]')).map(migrateCharacter);
  } catch {
    characters = [];
  }

  try {
    const rawHB = localStorage.getItem(STORAGE_KEY_HOMEBREW);
    homebrew = JSON.parse(rawHB || '{"races":[],"classes":[],"spells":[],"items":[]}');
  } catch {
    homebrew = { races: [], classes: [], spells: [], items: [] };
  }

  refreshDataLists();
}

function saveAll() {
  localStorage.setItem(STORAGE_KEY_CHARS, JSON.stringify(characters));
}

function saveHomebrew() {
  localStorage.setItem(STORAGE_KEY_HOMEBREW, JSON.stringify(homebrew));
}

// ── Acesso ao personagem atual ────────────────────────────────
function getCurrentCharacter() {
  return characters.find(c => c.id === currentId);
}

// ── Undo / Auto-save ──────────────────────────────────────────
function setField(path, value) {
  const char = getCurrentCharacter();
  if (!char) return;

  undoStack.push(JSON.parse(JSON.stringify(char)));
  if (undoStack.length > 30) undoStack.shift();
  showUndoBar('Campo atualizado');

  const parts = path.split('.');
  let obj = char;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!obj[parts[i]]) obj[parts[i]] = {};
    obj = obj[parts[i]];
  }
  obj[parts[parts.length - 1]] = value;

  scheduleAutoSave();
  recalcDerived();
}

function scheduleAutoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(saveAll, 1200);
}

function saveManual() {
  saveAll();
  showToast('Salvo!', 'success');
}

function undoLast() {
  if (!undoStack.length) {
    showToast('Nada a desfazer', 'info');
    return;
  }
  const snapshot = undoStack.pop();
  const idx = characters.findIndex(c => c.id === snapshot.id);
  if (idx >= 0) {
    characters[idx] = snapshot;
    saveAll();
    refreshSheet();
    showToast('Desfeito!', 'info');
  }
  document.getElementById('undo-bar').classList.remove('show');
}
