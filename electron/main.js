// electron/main.js
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(app.getPath('userData'), 'database');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
const DB_PATH = path.join(DB_DIR, 'grimorio.db');

let db;

function initDatabase() {
  const Database = require('better-sqlite3');
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS magias (
      id               TEXT PRIMARY KEY,
      nome             TEXT NOT NULL,
      nivel            INTEGER NOT NULL DEFAULT 0,
      escola           TEXT,
      classes          TEXT,
      tempo_conjuracao TEXT,
      alcance          TEXT,
      componentes      TEXT,
      duracao          TEXT,
      dano             TEXT,
      efeito           TEXT,
      descricao        TEXT,
      fonte            TEXT DEFAULT 'custom',
      criado_em        DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS racas (
      id              TEXT PRIMARY KEY,
      nome            TEXT NOT NULL,
      bonus_atributo  TEXT,
      caracteristicas TEXT,
      fonte           TEXT DEFAULT 'custom'
    );

    CREATE TABLE IF NOT EXISTS classes (
      id          TEXT PRIMARY KEY,
      nome        TEXT NOT NULL,
      dado_vida   TEXT,
      descricao   TEXT,
      fonte       TEXT DEFAULT 'custom'
    );

    CREATE TABLE IF NOT EXISTS itens (
      id        TEXT PRIMARY KEY,
      nome      TEXT NOT NULL,
      peso      REAL,
      descricao TEXT,
      fonte     TEXT DEFAULT 'custom'
    );

    CREATE TABLE IF NOT EXISTS personagens (
      id        TEXT PRIMARY KEY,
      nome      TEXT NOT NULL,
      dados     TEXT NOT NULL,
      retrato   TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      salvo_em  DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('[DB] Banco iniciado em:', DB_PATH);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400, height: 900, minWidth: 900, minHeight: 600,
    backgroundColor: '#0e0c09',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  win.loadFile(path.join(__dirname, '../src/index.html'));
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => { initDatabase(); createWindow(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// ── HELPER: gera id a partir do nome ─────────────────────────────────────────
function gerarId(nome, prefixo = '') {
  const slug = nome.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  return prefixo ? `${prefixo}-${slug}` : slug;
}

// ══════════════════════════════════════════════════════════════════════════════
// MAGIAS
// ══════════════════════════════════════════════════════════════════════════════

ipcMain.handle('magias:importar', async (_, magias) => {
  try {
    if (!Array.isArray(magias) || magias.length === 0)
      return { sucesso: false, mensagem: 'Nenhuma magia recebida.' };

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO magias
        (id, nome, nivel, escola, classes, tempo_conjuracao, alcance, componentes, duracao, dano, efeito, descricao, fonte)
      VALUES
        (@id, @nome, @nivel, @escola, @classes, @tempo_conjuracao, @alcance, @componentes, @duracao, @dano, @efeito, @descricao, @fonte)
    `);

    const inserir = db.transaction((lista) => {
      let n = 0;
      for (const m of lista) { const r = stmt.run(m); if (r.changes > 0) n++; }
      return n;
    });

    const inseridas = inserir(magias);
    const ignoradas = magias.length - inseridas;
    return {
      sucesso: true,
      mensagem: `${inseridas} magia(s) importada(s).${ignoradas > 0 ? ` ${ignoradas} ignorada(s) por duplicata.` : ''}`,
      inseridas, ignoradas
    };
  } catch (e) { return { sucesso: false, mensagem: e.message }; }
});

ipcMain.handle('magias:buscarTodas', async () => {
  try { return { sucesso: true, dados: db.prepare('SELECT * FROM magias ORDER BY nivel, nome').all() }; }
  catch (e) { return { sucesso: false, mensagem: e.message }; }
});

ipcMain.handle('magias:buscar', async (_, termo) => {
  try {
    const t = `%${termo}%`;
    return { sucesso: true, dados: db.prepare('SELECT * FROM magias WHERE nome LIKE ? OR escola LIKE ? OR classes LIKE ? LIMIT 100').all(t, t, t) };
  } catch (e) { return { sucesso: false, mensagem: e.message }; }
});

ipcMain.handle('magias:buscarPorClasse', async (_, classe) => {
  try {
    return { sucesso: true, dados: db.prepare("SELECT * FROM magias WHERE classes LIKE ? ORDER BY nivel, nome").all(`%${classe}%`) };
  } catch (e) { return { sucesso: false, mensagem: e.message }; }
});

ipcMain.handle('magias:deletar', async (_, id) => {
  try { db.prepare('DELETE FROM magias WHERE id = ?').run(id); return { sucesso: true }; }
  catch (e) { return { sucesso: false, mensagem: e.message }; }
});

// ══════════════════════════════════════════════════════════════════════════════
// HOMEBREW COMPLETO (raças, classes, itens)
// ══════════════════════════════════════════════════════════════════════════════

// ── Raças ─────────────────────────────────────────────────────────────────────
ipcMain.handle('racas:importar', async (_, racas) => {
  try {
    const stmt = db.prepare(`INSERT OR IGNORE INTO racas (id,nome,bonus_atributo,caracteristicas,fonte) VALUES (@id,@nome,@bonus_atributo,@caracteristicas,@fonte)`);
    const inserir = db.transaction((l) => { let n=0; for(const r of l){const x=stmt.run(r);if(x.changes>0)n++;} return n; });
    const n = inserir(racas);
    return { sucesso: true, mensagem: `${n} raça(s) importada(s).`, inseridas: n };
  } catch(e) { return { sucesso: false, mensagem: e.message }; }
});

ipcMain.handle('racas:buscarTodas', async () => {
  try { return { sucesso: true, dados: db.prepare('SELECT * FROM racas ORDER BY nome').all() }; }
  catch(e) { return { sucesso: false, mensagem: e.message }; }
});

ipcMain.handle('racas:deletar', async (_, id) => {
  try { db.prepare('DELETE FROM racas WHERE id=?').run(id); return { sucesso: true }; }
  catch(e) { return { sucesso: false, mensagem: e.message }; }
});

// ── Classes ───────────────────────────────────────────────────────────────────
ipcMain.handle('classes:importar', async (_, classes) => {
  try {
    const stmt = db.prepare(`INSERT OR IGNORE INTO classes (id,nome,dado_vida,descricao,fonte) VALUES (@id,@nome,@dado_vida,@descricao,@fonte)`);
    const inserir = db.transaction((l) => { let n=0; for(const c of l){const x=stmt.run(c);if(x.changes>0)n++;} return n; });
    const n = inserir(classes);
    return { sucesso: true, mensagem: `${n} classe(s) importada(s).`, inseridas: n };
  } catch(e) { return { sucesso: false, mensagem: e.message }; }
});

ipcMain.handle('classes:buscarTodas', async () => {
  try { return { sucesso: true, dados: db.prepare('SELECT * FROM classes ORDER BY nome').all() }; }
  catch(e) { return { sucesso: false, mensagem: e.message }; }
});

ipcMain.handle('classes:deletar', async (_, id) => {
  try { db.prepare('DELETE FROM classes WHERE id=?').run(id); return { sucesso: true }; }
  catch(e) { return { sucesso: false, mensagem: e.message }; }
});

// ── Itens ─────────────────────────────────────────────────────────────────────
ipcMain.handle('itens:importar', async (_, itens) => {
  try {
    const stmt = db.prepare(`INSERT OR IGNORE INTO itens (id,nome,peso,descricao,fonte) VALUES (@id,@nome,@peso,@descricao,@fonte)`);
    const inserir = db.transaction((l) => { let n=0; for(const i of l){const x=stmt.run(i);if(x.changes>0)n++;} return n; });
    const n = inserir(itens);
    return { sucesso: true, mensagem: `${n} item(s) importado(s).`, inseridas: n };
  } catch(e) { return { sucesso: false, mensagem: e.message }; }
});

ipcMain.handle('itens:buscarTodas', async () => {
  try { return { sucesso: true, dados: db.prepare('SELECT * FROM itens ORDER BY nome').all() }; }
  catch(e) { return { sucesso: false, mensagem: e.message }; }
});

ipcMain.handle('itens:deletar', async (_, id) => {
  try { db.prepare('DELETE FROM itens WHERE id=?').run(id); return { sucesso: true }; }
  catch(e) { return { sucesso: false, mensagem: e.message }; }
});

// ══════════════════════════════════════════════════════════════════════════════
// SINCRONIZAÇÃO VIA URL (pacote homebrew do mestre)
// ══════════════════════════════════════════════════════════════════════════════

ipcMain.handle('homebrew:sincronizarURL', async (_, url) => {
  try {
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    const pacote = await resposta.json();

    const resultado = { magias: 0, racas: 0, classes: 0, itens: 0, erros: [] };

    // Magias
    if (Array.isArray(pacote.magias) && pacote.magias.length > 0) {
      const mapeadas = pacote.magias.map(m => ({
        id: m.id || gerarId(m.nome || m.name, 'hb'),
        nome: m.nome || m.name || '',
        nivel: parseInt(m.nivel ?? m.level ?? 0),
        escola: m.escola || m.school || '',
        classes: Array.isArray(m.classes) ? m.classes.join(', ') : (m.classes || ''),
        tempo_conjuracao: m.tempo_conjuracao || m.casting_time || '',
        alcance: m.alcance || m.range || '',
        componentes: Array.isArray(m.componentes) ? m.componentes.join(', ') : (m.componentes || ''),
        duracao: m.duracao || m.duration || '',
        dano: m.dano || '',
        efeito: m.efeito || '',
        descricao: Array.isArray(m.descricao) ? m.descricao.join('\n\n') : (m.descricao || m.desc || ''),
        fonte: m.fonte || 'homebrew'
      })).filter(m => m.nome);

      const r = await ipcMain.emit('magias:importar', null, mapeadas); // chama direto
      // insere direto
      const stmt = db.prepare(`INSERT OR IGNORE INTO magias (id,nome,nivel,escola,classes,tempo_conjuracao,alcance,componentes,duracao,dano,efeito,descricao,fonte) VALUES (@id,@nome,@nivel,@escola,@classes,@tempo_conjuracao,@alcance,@componentes,@duracao,@dano,@efeito,@descricao,@fonte)`);
      const tx = db.transaction((l) => { let n=0; for(const x of l){if(stmt.run(x).changes>0)n++;} return n; });
      resultado.magias = tx(mapeadas);
    }

    // Raças
    if (Array.isArray(pacote.racas) && pacote.racas.length > 0) {
      const mapeadas = pacote.racas.map(r => ({
        id: r.id || gerarId(r.nome || '', 'raca'),
        nome: r.nome || '',
        bonus_atributo: r.bonus_atributo || '',
        caracteristicas: r.caracteristicas || '',
        fonte: 'homebrew'
      })).filter(r => r.nome);
      const stmt = db.prepare(`INSERT OR IGNORE INTO racas (id,nome,bonus_atributo,caracteristicas,fonte) VALUES (@id,@nome,@bonus_atributo,@caracteristicas,@fonte)`);
      const tx = db.transaction((l) => { let n=0; for(const x of l){if(stmt.run(x).changes>0)n++;} return n; });
      resultado.racas = tx(mapeadas);
    }

    // Classes
    if (Array.isArray(pacote.classes) && pacote.classes.length > 0) {
      const mapeadas = pacote.classes.map(c => ({
        id: c.id || gerarId(c.nome || '', 'classe'),
        nome: c.nome || '',
        dado_vida: c.dado_vida || 'd8',
        descricao: c.descricao || '',
        fonte: 'homebrew'
      })).filter(c => c.nome);
      const stmt = db.prepare(`INSERT OR IGNORE INTO classes (id,nome,dado_vida,descricao,fonte) VALUES (@id,@nome,@dado_vida,@descricao,@fonte)`);
      const tx = db.transaction((l) => { let n=0; for(const x of l){if(stmt.run(x).changes>0)n++;} return n; });
      resultado.classes = tx(mapeadas);
    }

    // Itens
    if (Array.isArray(pacote.itens) && pacote.itens.length > 0) {
      const mapeadas = pacote.itens.map(i => ({
        id: i.id || gerarId(i.nome || '', 'item'),
        nome: i.nome || '',
        peso: parseFloat(i.peso) || 0,
        descricao: i.descricao || '',
        fonte: 'homebrew'
      })).filter(i => i.nome);
      const stmt = db.prepare(`INSERT OR IGNORE INTO itens (id,nome,peso,descricao,fonte) VALUES (@id,@nome,@peso,@descricao,@fonte)`);
      const tx = db.transaction((l) => { let n=0; for(const x of l){if(stmt.run(x).changes>0)n++;} return n; });
      resultado.itens = tx(mapeadas);
    }

    return {
      sucesso: true,
      mensagem: `Sincronizado! ${resultado.magias} magia(s), ${resultado.racas} raça(s), ${resultado.classes} classe(s), ${resultado.itens} item(s) importado(s).`,
      ...resultado
    };

  } catch(e) { return { sucesso: false, mensagem: `Erro ao sincronizar: ${e.message}` }; }
});

// ══════════════════════════════════════════════════════════════════════════════
// PERSONAGENS
// ══════════════════════════════════════════════════════════════════════════════

ipcMain.handle('personagens:salvar', async (_, p) => {
  try {
    db.prepare(`INSERT INTO personagens (id,nome,dados,retrato) VALUES (@id,@nome,@dados,@retrato) ON CONFLICT(id) DO UPDATE SET nome=@nome,dados=@dados,retrato=@retrato,salvo_em=CURRENT_TIMESTAMP`)
      .run({ id: p.id, nome: p.nome, dados: JSON.stringify(p.dados), retrato: p.retrato || null });
    return { sucesso: true };
  } catch(e) { return { sucesso: false, mensagem: e.message }; }
});

ipcMain.handle('personagens:buscarTodos', async () => {
  try {
    return { sucesso: true, dados: db.prepare('SELECT * FROM personagens ORDER BY salvo_em DESC').all().map(r => ({ ...r, dados: JSON.parse(r.dados) })) };
  } catch(e) { return { sucesso: false, mensagem: e.message }; }
});

ipcMain.handle('personagens:deletar', async (_, id) => {
  try { db.prepare('DELETE FROM personagens WHERE id=?').run(id); return { sucesso: true }; }
  catch(e) { return { sucesso: false, mensagem: e.message }; }
});

// ── API externa (evita CORS) ──────────────────────────────────────────────────
ipcMain.handle('api:buscarOpen5e', async (_, url) => {
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return { sucesso: true, dados: await r.json() };
  } catch(e) { return { sucesso: false, mensagem: e.message }; }
});