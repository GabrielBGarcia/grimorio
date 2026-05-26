# Grimório — Desktop App (Electron)

## Arquivos gerados

```
grimorio/
├── setup.bat              ← Rode no Windows para configurar tudo
├── setup.sh               ← Rode no Linux/Mac para configurar tudo
├── package.json           ← Configuração do projeto Electron
│
├── electron/
│   ├── main.js            ← Processo principal: janela + banco de dados
│   └── preload.js         ← Ponte segura entre Node e frontend
│
└── src/
    ├── index.html         ← Sua ficha existente (mover para cá)
    ├── css/               ← Sua pasta CSS existente (mover para cá)
    ├── js/                ← Sua pasta JS existente (mover para cá)
    ├── importar-magias.html  ← Nova tela de importação
    └── importar-magias.js    ← Lógica da importação
```

## Como instalar

### Windows
```
setup.bat
```

### Linux / Mac
```bash
chmod +x setup.sh
./setup.sh
```

## Como rodar

```bash
npm start
```

## Como adicionar botão "Importar Magias" na ficha existente

No seu `src/index.html`, dentro do header, adicione:

```html
<button class="hbtn" onclick="window.location.href='importar-magias.html'">
  ✦ Importar Magias
</button>
```

## IPC disponíveis (window.grimorio.*)

| Método | Descrição |
|--------|-----------|
| `importarMagias(array)` | Insere magias em lote no SQLite |
| `buscarTodasMagias()` | Retorna todas as magias salvas |
| `buscarMagias(termo)` | Busca magias por nome/escola/descrição |
| `deletarMagia(id)` | Remove uma magia pelo id |
| `salvarPersonagem(obj)` | Salva/atualiza um personagem |
| `buscarPersonagens()` | Retorna todos os personagens |
| `deletarPersonagem(id)` | Remove um personagem |
| `buscarAPI(url)` | Faz requisição HTTP via processo principal (sem CORS) |

## Banco de dados

Salvo em:
- **Windows:** `%APPDATA%\grimorio\database\grimorio.db`
- **Mac:** `~/Library/Application Support/grimorio/database/grimorio.db`
- **Linux:** `~/.config/grimorio/database/grimorio.db`
