// electron/preload.js
// Ponte segura entre o processo Node (main) e o frontend (renderer)
// contextBridge expõe APENAS as funções que o frontend precisa — nada mais.

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('grimorio', {

  // ── MAGIAS ──────────────────────────────────────────────────────────────────

  /** Importa um array de magias mapeadas para o banco SQLite */
  importarMagias: (magias) =>
    ipcRenderer.invoke('magias:importar', magias),

  /** Retorna todas as magias salvas */
  buscarTodasMagias: () =>
    ipcRenderer.invoke('magias:buscarTodas'),

  /** Busca magias pelo nome, escola ou descrição */
  buscarMagias: (termo) =>
    ipcRenderer.invoke('magias:buscar', termo),

  /** Remove uma magia pelo id */
  deletarMagia: (id) =>
    ipcRenderer.invoke('magias:deletar', id),

  // ── PERSONAGENS ─────────────────────────────────────────────────────────────

  /** Salva ou atualiza um personagem */
  salvarPersonagem: (personagem) =>
    ipcRenderer.invoke('personagens:salvar', personagem),

  /** Retorna todos os personagens salvos */
  buscarPersonagens: () =>
    ipcRenderer.invoke('personagens:buscarTodos'),

  /** Remove um personagem pelo id */
  deletarPersonagem: (id) =>
    ipcRenderer.invoke('personagens:deletar', id),

  // ── API EXTERNA ─────────────────────────────────────────────────────────────

  /**
   * Faz uma requisição HTTP via processo principal (evita CORS).
   * Use para acessar a API Open5e ou qualquer outra URL externa.
   */
  buscarAPI: (url) =>
    ipcRenderer.invoke('api:buscarOpen5e', url),

});

// Indica no console que o preload carregou (útil para debug)
console.log('[Preload] API grimorio exposta ao frontend.');
