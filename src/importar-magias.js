// src/importar-magias.js
// Lógica da tela de importação de magias (frontend — Vanilla JS puro)
// Funciona em conjunto com electron/main.js via window.grimorio (preload)

'use strict';

// ══════════════════════════════════════════════════════════════════════════════
// MAPPER — transforma qualquer formato de entrada no schema interno
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Normaliza uma única entrada (objeto bruto) para o schema do banco.
 * Aceita tanto nomes em inglês (API Open5e) quanto em português (JSON manual).
 *
 * @param {Object} raw - Objeto bruto (da API ou do JSON colado)
 * @returns {Object|null} - Objeto normalizado ou null se inválido
 */
function mapearMagia(raw) {
  if (!raw || typeof raw !== 'object') return null;

  // ── Nome ──────────────────────────────────────────────────────────────────
  const nome = (raw.nome || raw.name || '').toString().trim();
  if (!nome) return null; // obrigatório

  // ── Nível (0 = cantrip) ───────────────────────────────────────────────────
  const nivelRaw = raw.nivel ?? raw.level ?? raw.spell_level ?? 0;
  const nivel = parseInt(nivelRaw, 10);
  if (isNaN(nivel) || nivel < 0 || nivel > 9) return null;

  // ── Escola ────────────────────────────────────────────────────────────────
  // Na Open5e, school pode ser { name: "Evocation" } ou uma string direta
  let escola = '';
  if (raw.escola) {
    escola = raw.escola;
  } else if (raw.school) {
    escola = typeof raw.school === 'object' ? (raw.school.name || '') : raw.school;
  }
  escola = escola.toString().trim();

  // ── Tempo de Conjuração ───────────────────────────────────────────────────
  const tempo_conjuracao = (
    raw.tempo_conjuracao || raw.casting_time || ''
  ).toString().trim();

  // ── Alcance ───────────────────────────────────────────────────────────────
  const alcance = (raw.alcance || raw.range || '').toString().trim();

  // ── Componentes ───────────────────────────────────────────────────────────
  let componentes = '';
  if (raw.componentes) {
    componentes = raw.componentes;
  } else if (raw.components) {
    // Na Open5e, components pode ser array ["V","S","M"] ou string
    componentes = Array.isArray(raw.components)
      ? raw.components.join(', ')
      : raw.components;
  }
  componentes = componentes.toString().trim();

  // ── Duração ───────────────────────────────────────────────────────────────
  const duracao = (raw.duracao || raw.duration || '').toString().trim();

  // ── Descrição ─────────────────────────────────────────────────────────────
  // Na Open5e, desc pode ser array de parágrafos ou string
  let descricao = '';
  if (raw.descricao) {
    descricao = Array.isArray(raw.descricao)
      ? raw.descricao.join('\n\n')
      : raw.descricao;
  } else if (raw.desc) {
    descricao = Array.isArray(raw.desc)
      ? raw.desc.join('\n\n')
      : raw.desc;
  }
  descricao = descricao.toString().trim();

  // ── Fonte ─────────────────────────────────────────────────────────────────
  const fonte = (raw.fonte || raw.document__slug || 'custom').toString().trim();

  // ── ID único ─────────────────────────────────────────────────────────────
  // Prioridade: id explícito > slug da API > nome normalizado
  const id = (
    raw.id ||
    raw.slug ||
    nome.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
  ).toString().trim();

  return { id, nome, nivel, escola, tempo_conjuracao, alcance, componentes, duracao, descricao, fonte };
}

/**
 * Recebe um array bruto e retorna apenas as magias válidas e mapeadas.
 * Remove nulls (entradas inválidas) e objetos que não tenham nome.
 *
 * @param {Array} lista - Lista bruta de objetos
 * @returns {Object[]} - Lista de magias mapeadas e válidas
 */
function mapearLista(lista) {
  if (!Array.isArray(lista)) {
    // Se veio um objeto único, transforma em array
    lista = [lista];
  }
  return lista.map(mapearMagia).filter(Boolean);
}


// ══════════════════════════════════════════════════════════════════════════════
// ESTADO LOCAL
// ══════════════════════════════════════════════════════════════════════════════

/** Magias atualmente na prévia aguardando confirmação */
let magiasNaPrevia = [];

/** Cache da biblioteca local para filtragem sem nova consulta */
let cacheBiblioteca = [];


// ══════════════════════════════════════════════════════════════════════════════
// UTILITÁRIOS DE UI
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Exibe uma mensagem de feedback em um elemento de feedback.
 * @param {string} elementId - ID do elemento .feedback
 * @param {'success'|'error'|'info'} tipo
 * @param {string} mensagem
 */
function mostrarFeedback(elementId, tipo, mensagem) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const icons = { success: '✦', error: '✕', info: 'ℹ' };

  el.className = `feedback show ${tipo}`;
  el.innerHTML = `
    <span class="feedback-icon">${icons[tipo] || 'ℹ'}</span>
    <span>${mensagem}</span>
  `;
}

function esconderFeedback(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.classList.remove('show');
}

/**
 * Coloca um botão em estado de loading (desativa + mostra spinner).
 * @param {string} btnId
 * @param {boolean} ativo
 */
function setLoading(btnId, ativo) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = ativo;
  btn.classList.toggle('loading', ativo);
}

/**
 * Atualiza a barra de progresso da busca na API.
 * @param {number} pct - 0 a 100
 * @param {string} texto - Texto descritivo
 */
function setProgresso(pct, texto) {
  const wrap = document.getElementById('progress-wrap');
  const label = document.getElementById('progress-label');
  const fill = document.getElementById('progress-fill');

  if (!wrap) return;

  if (pct < 0) {
    // Esconde
    wrap.classList.remove('show');
    return;
  }

  wrap.classList.add('show');
  if (label) label.textContent = texto || `${pct}%`;
  if (fill) fill.style.width = `${Math.min(pct, 100)}%`;
}


// ══════════════════════════════════════════════════════════════════════════════
// PRÉVIA — exibe tabela com magias antes de confirmar
// ══════════════════════════════════════════════════════════════════════════════

function mostrarPrevia(magias) {
  magiasNaPrevia = magias;

  const section = document.getElementById('preview-section');
  const count = document.getElementById('preview-count');
  const tbody = document.getElementById('preview-tbody');

  if (!section || !count || !tbody) return;

  count.innerHTML = `<strong>${magias.length}</strong> magia(s) prontas para importação.`;

  tbody.innerHTML = magias.map(m => {
    const nivelTxt = m.nivel === 0 ? 'Truque' : `Nv ${m.nivel}`;
    const nivelClass = m.nivel === 0 ? 'lvl-badge cantrip' : 'lvl-badge';
    const descResumo = m.descricao.length > 80
      ? m.descricao.substring(0, 80) + '…'
      : m.descricao;

    return `
      <tr>
        <td><span class="${nivelClass}">${nivelTxt}</span></td>
        <td><strong>${escapeHTML(m.nome)}</strong></td>
        <td><span class="school-txt">${escapeHTML(m.escola)}</span></td>
        <td>${escapeHTML(m.tempo_conjuracao)}</td>
        <td><span class="desc-txt">${escapeHTML(descResumo)}</span></td>
      </tr>
    `;
  }).join('');

  section.classList.add('show');
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cancelarPrevia() {
  magiasNaPrevia = [];
  const section = document.getElementById('preview-section');
  if (section) section.classList.remove('show');
  esconderFeedback('fb-confirmar');
}

function escapeHTML(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}


// ══════════════════════════════════════════════════════════════════════════════
// AÇÃO 1 — Importar JSON colado manualmente
// ══════════════════════════════════════════════════════════════════════════════

async function importarJSON() {
  esconderFeedback('fb-json');
  cancelarPrevia();

  const textarea = document.getElementById('json-input');
  const texto = textarea ? textarea.value.trim() : '';

  if (!texto) {
    mostrarFeedback('fb-json', 'error', 'O campo JSON está vazio. Cole um JSON válido antes de importar.');
    return;
  }

  setLoading('btn-importar-json', true);

  try {
    // ── Parse do JSON ──────────────────────────────────────────────────────
    let dados;
    try {
      dados = JSON.parse(texto);
    } catch (parseErro) {
      throw new Error(`JSON inválido: ${parseErro.message}. Verifique vírgulas, aspas e chaves abertas/fechadas.`);
    }

    // ── Mapeamento ─────────────────────────────────────────────────────────
    const magias = mapearLista(dados);

    if (magias.length === 0) {
      throw new Error('Nenhuma magia válida encontrada no JSON. Verifique se os campos "name/nome" e "level/nivel" estão presentes.');
    }

    // ── Exibe prévia antes de salvar ───────────────────────────────────────
    mostrarFeedback('fb-json', 'info', `${magias.length} magia(s) encontradas. Confirme na prévia abaixo para salvar.`);
    mostrarPrevia(magias);

  } catch (erro) {
    mostrarFeedback('fb-json', 'error', erro.message);
  } finally {
    setLoading('btn-importar-json', false);
  }
}

function limparJSON() {
  const textarea = document.getElementById('json-input');
  if (textarea) textarea.value = '';
  esconderFeedback('fb-json');
  cancelarPrevia();
}


// ══════════════════════════════════════════════════════════════════════════════
// AÇÃO 2 — Buscar da API Open5e (paginada)
// ══════════════════════════════════════════════════════════════════════════════

const OPEN5E_URL = 'https://api.open5e.com/v1/spells/?limit=50&format=json';

async function buscarOpen5e() {
  esconderFeedback('fb-api');
  cancelarPrevia();
  setLoading('btn-buscar-api', true);
  setProgresso(5, 'Conectando à API Open5e...');

  try {
    // Verifica se a API do Electron está disponível
    if (!window.grimorio) {
      throw new Error('API do Electron não disponível. Verifique se o app está rodando via Electron.');
    }

    let todasMagias = [];
    let proximaUrl = OPEN5E_URL;
    let pagina = 1;
    let totalPaginas = null;

    // ── Paginação ──────────────────────────────────────────────────────────
    while (proximaUrl) {
      setProgresso(
        totalPaginas ? Math.round((pagina / totalPaginas) * 90) : 20,
        `Buscando página ${pagina}${totalPaginas ? ` de ${totalPaginas}` : ''}...`
      );

      const resultado = await window.grimorio.buscarAPI(proximaUrl);

      if (!resultado.sucesso) {
        throw new Error(`Erro na API: ${resultado.mensagem}`);
      }

      const dados = resultado.dados;

      // Calcula total de páginas na primeira resposta
      if (totalPaginas === null && dados.count) {
        totalPaginas = Math.ceil(dados.count / 50);
      }

      // Acumula resultados
      if (Array.isArray(dados.results)) {
        todasMagias = todasMagias.concat(dados.results);
      }

      // Avança para próxima página
      proximaUrl = dados.next || null;
      pagina++;
    }

    setProgresso(95, 'Mapeando dados...');

    // ── Mapeamento ─────────────────────────────────────────────────────────
    const magias = mapearLista(todasMagias);

    if (magias.length === 0) {
      throw new Error('A API não retornou magias válidas. Tente novamente.');
    }

    setProgresso(-1);
    mostrarFeedback('fb-api', 'info', `${magias.length} magia(s) encontradas. Confirme na prévia abaixo para salvar.`);
    mostrarPrevia(magias);

  } catch (erro) {
    setProgresso(-1);
    mostrarFeedback('fb-api', 'error', `Falha ao buscar da API: ${erro.message}`);
  } finally {
    setLoading('btn-buscar-api', false);
  }
}


// ══════════════════════════════════════════════════════════════════════════════
// AÇÃO 3 — Confirmar importação (salva no banco via IPC)
// ══════════════════════════════════════════════════════════════════════════════

async function confirmarImportacao() {
  if (magiasNaPrevia.length === 0) {
    mostrarFeedback('fb-confirmar', 'error', 'Nenhuma magia na prévia para confirmar.');
    return;
  }

  esconderFeedback('fb-confirmar');
  setLoading('btn-confirmar', true);

  try {
    if (!window.grimorio) {
      throw new Error('API do Electron não disponível.');
    }

    const resultado = await window.grimorio.importarMagias(magiasNaPrevia);

    if (!resultado.sucesso) {
      throw new Error(resultado.mensagem);
    }

    mostrarFeedback('fb-confirmar', 'success', `✦ ${resultado.mensagem}`);

    // Limpa prévia e recarrega biblioteca
    magiasNaPrevia = [];
    setTimeout(() => {
      document.getElementById('preview-section').classList.remove('show');
      carregarBiblioteca();
    }, 2000);

  } catch (erro) {
    mostrarFeedback('fb-confirmar', 'error', `Erro ao salvar: ${erro.message}`);
  } finally {
    setLoading('btn-confirmar', false);
  }
}


// ══════════════════════════════════════════════════════════════════════════════
// BIBLIOTECA LOCAL — exibe magias já salvas
// ══════════════════════════════════════════════════════════════════════════════

async function carregarBiblioteca() {
  const container = document.getElementById('lib-container');
  if (!container) return;

  if (!window.grimorio) {
    container.innerHTML = '<div class="lib-empty">Disponível apenas no app desktop.</div>';
    return;
  }

  try {
    const resultado = await window.grimorio.buscarTodasMagias();
    if (!resultado.sucesso) throw new Error(resultado.mensagem);

    cacheBiblioteca = resultado.dados;
    renderizarBiblioteca(cacheBiblioteca);
  } catch (erro) {
    container.innerHTML = `<div class="lib-empty">Erro ao carregar: ${erro.message}</div>`;
  }
}

function renderizarBiblioteca(magias) {
  const container = document.getElementById('lib-container');
  if (!container) return;

  if (magias.length === 0) {
    container.innerHTML = '<div class="lib-empty">Nenhuma magia salva ainda. Importe usando as opções acima.</div>';
    return;
  }

  container.innerHTML = `
    <div class="preview-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Nível</th>
            <th>Nome</th>
            <th>Escola</th>
            <th>Tempo de Conjuração</th>
            <th>Fonte</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${magias.map(m => {
            const nivelTxt = m.nivel === 0 ? 'Truque' : `Nv ${m.nivel}`;
            const nivelClass = m.nivel === 0 ? 'lvl-badge cantrip' : 'lvl-badge';
            return `
              <tr>
                <td><span class="${nivelClass}">${nivelTxt}</span></td>
                <td><strong>${escapeHTML(m.nome)}</strong></td>
                <td><span class="school-txt">${escapeHTML(m.escola)}</span></td>
                <td>${escapeHTML(m.tempo_conjuracao)}</td>
                <td style="font-size:.72rem;color:var(--text-dim)">${escapeHTML(m.fonte)}</td>
                <td>
                  <button
                    onclick="deletarMagia('${escapeHTML(m.id)}', '${escapeHTML(m.nome)}')"
                    style="background:transparent;border:none;color:rgba(139,26,26,.6);cursor:pointer;font-size:.85rem;padding:0 4px;transition:color .15s"
                    onmouseover="this.style.color='#c0392b'"
                    onmouseout="this.style.color='rgba(139,26,26,.6)'"
                    title="Remover magia"
                  >✕</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
    <div style="font-family:'Cinzel',serif;font-size:.6rem;color:var(--text-dim);margin-top:.5rem;text-align:right">
      ${magias.length} magia(s) no banco local
    </div>
  `;
}

function filtrarBiblioteca(termo) {
  if (!termo.trim()) {
    renderizarBiblioteca(cacheBiblioteca);
    return;
  }
  const t = termo.toLowerCase();
  const filtradas = cacheBiblioteca.filter(m =>
    m.nome.toLowerCase().includes(t) ||
    (m.escola || '').toLowerCase().includes(t) ||
    (m.fonte || '').toLowerCase().includes(t)
  );
  renderizarBiblioteca(filtradas);
}

async function deletarMagia(id, nome) {
  if (!confirm(`Remover a magia "${nome}" do banco local?`)) return;

  try {
    const resultado = await window.grimorio.deletarMagia(id);
    if (!resultado.sucesso) throw new Error(resultado.mensagem);
    await carregarBiblioteca();
  } catch (erro) {
    alert(`Erro ao deletar: ${erro.message}`);
  }
}


// ══════════════════════════════════════════════════════════════════════════════
// INICIALIZAÇÃO
// ══════════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  carregarBiblioteca();
});
