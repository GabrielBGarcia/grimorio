/* ═══════════════════════════════════════
   GRIMÓRIO — constants.js
   Dados estáticos: atributos, perícias, condições, tabelas SRD
   ═══════════════════════════════════════ */

const ATTRS = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

const ATTR_LABELS = {
  str: 'Força',
  dex: 'Destreza',
  con: 'Constituição',
  int: 'Inteligência',
  wis: 'Sabedoria',
  cha: 'Carisma',
};

const SKILLS = [
  { name: 'Acrobacia',        attr: 'dex' },
  { name: 'Arcanismo',        attr: 'int' },
  { name: 'Atletismo',        attr: 'str' },
  { name: 'Atuação',          attr: 'cha' },
  { name: 'Enganação',        attr: 'cha' },
  { name: 'Furtividade',      attr: 'dex' },
  { name: 'História',         attr: 'int' },
  { name: 'Intimidação',      attr: 'cha' },
  { name: 'Intuição',         attr: 'wis' },
  { name: 'Investigação',     attr: 'int' },
  { name: 'Lidar com Animais',attr: 'wis' },
  { name: 'Medicina',         attr: 'wis' },
  { name: 'Natureza',         attr: 'int' },
  { name: 'Percepção',        attr: 'wis' },
  { name: 'Persuasão',        attr: 'cha' },
  { name: 'Prestidigitação',  attr: 'dex' },
  { name: 'Religião',         attr: 'int' },
  { name: 'Sobrevivência',    attr: 'wis' },
];

const CONDITIONS = [
  'Amedrontado', 'Agarrado', 'Atordoado', 'Cego',
  'Dominado', 'Enfeitiçado', 'Envenenado', 'Exausto',
  'Incapacitado', 'Inconsciente', 'Invisível', 'Paralisado',
  'Petrificado', 'Prostrado', 'Surdo',
];

const SPELL_SLOT_TABLE = [
  [0],
  [2, 0, 0],
  [3, 0, 0],
  [4, 2, 0],
  [4, 3, 0],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 2],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
];

const POINT_BUY_COST = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

const SRD_SPELLS = [
  { name: 'Luz',                   level: 0, school: 'Evocação' },
  { name: 'Prestidigitação',       level: 0, school: 'Transmutação' },
  { name: 'Ilusão Menor',          level: 0, school: 'Ilusão' },
  { name: 'Raio de Frio',          level: 0, school: 'Evocação' },
  { name: 'Chama Sagrada',         level: 0, school: 'Evocação' },
  { name: 'Taumaturgia',           level: 0, school: 'Transmutação' },
  { name: 'Mísseis Mágicos',       level: 1, school: 'Evocação' },
  { name: 'Escudo',                level: 1, school: 'Abjuração' },
  { name: 'Dormir',                level: 1, school: 'Encantamento' },
  { name: 'Cura de Ferimentos',    level: 1, school: 'Evocação' },
  { name: 'Graça de Benção',       level: 1, school: 'Encantamento' },
  { name: 'Detectar Magia',        level: 1, school: 'Adivinhação' },
  { name: 'Armadura de Mago',      level: 1, school: 'Abjuração' },
  { name: 'Passo Nebuloso',        level: 2, school: 'Conjuração' },
  { name: 'Invisibilidade',        level: 2, school: 'Ilusão' },
  { name: 'Sugestão',              level: 2, school: 'Encantamento' },
  { name: 'Cura em Massa',         level: 2, school: 'Evocação' },
  { name: 'Bola de Fogo',          level: 3, school: 'Evocação' },
  { name: 'Relâmpago',             level: 3, school: 'Evocação' },
  { name: 'Voo',                   level: 3, school: 'Transmutação' },
  { name: 'Contrafeitiço',         level: 3, school: 'Abjuração' },
  { name: 'Dimensão Porta',        level: 4, school: 'Conjuração' },
  { name: 'Expulsar',              level: 4, school: 'Abjuração' },
  { name: 'Metamorfose',           level: 4, school: 'Transmutação' },
  { name: 'Morte Maior',           level: 5, school: 'Necromancia' },
  { name: 'Teleporte',             level: 7, school: 'Conjuração' },
  { name: 'Desejo',                level: 9, school: 'Conjuração' },
];

const SRD_ITEMS = [
  { name: 'Espada Longa',               weight: '1.5' },
  { name: 'Espada Curta',               weight: '0.9' },
  { name: 'Adaga',                      weight: '0.5' },
  { name: 'Arco Longo',                 weight: '1'   },
  { name: 'Arco Curto',                 weight: '0.9' },
  { name: 'Besta Pesada',               weight: '4.5' },
  { name: 'Armadura de Couro',          weight: '5'   },
  { name: 'Cota de Malha',              weight: '20'  },
  { name: 'Escudo',                     weight: '3'   },
  { name: 'Capa de Elfo',               weight: '0.5' },
  { name: 'Botas de Elfo',              weight: '0.5' },
  { name: 'Poção de Cura',              weight: '0.3' },
  { name: 'Poção de Cura Superior',     weight: '0.3' },
  { name: 'Varinha de Mísseis Mágicos', weight: '0.5' },
  { name: 'Vara de Magia',              weight: '0.5' },
  { name: 'Anel de Proteção',           weight: '0'   },
  { name: 'Amuleto de Saúde',           weight: '0'   },
  { name: 'Corda (15m)',                weight: '1'   },
  { name: 'Tocha',                      weight: '0.2' },
  { name: 'Ração de Viagem',            weight: '0.3' },
];

const SRD_RACES = [
  'Humano', 'Elfo', 'Anão', 'Halfling', 'Gnomo',
  'Meio-Elfo', 'Meio-Orc', 'Draconato', 'Tiefling',
];

const SRD_CLASSES = [
  'Bárbaro', 'Bardo', 'Clérigo', 'Druida', 'Feiticeiro',
  'Guerreiro', 'Ladino', 'Mago', 'Monge', 'Paladino',
  'Patrulheiro', 'Bruxo',
];

const CLASS_EMOJI_MAP = {
  guerreiro:  '⚔',
  mago:       '🧙',
  clérigo:    '✝',
  ladino:     '🗡',
  bárbaro:    '🪓',
  bardo:      '🎵',
  druida:     '🌿',
  monge:      '👊',
  paladino:   '⚜',
  patrulheiro:'🏹',
  feiticeiro: '✨',
  bruxo:      '🌙',
};

function getClassEmoji(className = '') {
  const lower = className.toLowerCase();
  const key = Object.keys(CLASS_EMOJI_MAP).find(k => lower.includes(k));
  return CLASS_EMOJI_MAP[key] || '🧝';
}
