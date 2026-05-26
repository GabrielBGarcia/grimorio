<div align="center">

# ⚔ Grimório — Ficha de RPG

**Ficha de personagem digital para D&D 5e e sistemas homebrew**  
Aplicativo desktop feito com Electron · Dark Medieval · 100% offline

</div>

---

## ✨ Funcionalidades

- 🧙 Criação e gerenciamento de múltiplos personagens
- ❤️ Tracker de HP com barra visual e saves de morte
- 🎒 Inventário com peso, moedas e busca
- ✦ Grimório de magias (SRD + homebrew)
- ⚗ Gerenciador de conteúdo homebrew (raças, classes, magias, itens)
- 🔗 Sincronização de homebrew por URL — o Mestre exporta, os players importam com um clique
- 📦 Exportação e importação por JSON e ZIP
- 🖼 Retrato do personagem com galeria de imagens extras
- 💾 Auto-save com suporte a desfazer

---

## 🚀 Como executar

### Opção 1 — Executável (recomendado)
1. Baixe o instalador em [Releases](https://github.com/GabrielBGarcia/grimorio/releases)
2. Execute o `.exe` e instale normalmente

### Opção 2 — Rodar pelo código fonte
```bash
# Clone o repositório
git clone https://github.com/GabrielBGarcia/grimorio.git
cd grimorio

# Instale as dependências
npm install

# Rode em modo desenvolvimento
npm start
```

---

## 🔗 Sistema de Sincronização (Mestre → Players)

O Mestre cria o conteúdo homebrew da campanha e distribui para os players via link:

1. **Mestre:** Abre o app → **🔗 Sincronizar** → aba **Exportar** → baixa o `grimorio-homebrew.json`
2. **Mestre:** Sobe o arquivo no Google Drive / GitHub / qualquer servidor e copia o link
3. **Players:** Abrem o app → **🔗 Sincronizar** → colam o link → clicam em **Sincronizar**

> 💡 Links do Google Drive são convertidos automaticamente para download direto.

---

## 📁 Estrutura do projeto

```
grimorio/
├── electron/
│   ├── main.js          # Processo principal do Electron
│   └── preload.js       # Bridge entre Electron e frontend
├── src/
│   ├── index.html       # Aplicação principal (ficha de personagem)
│   ├── importar-magias.html  # Importador de magias SRD
│   ├── css/             # Estilos separados
│   └── js/              # Módulos JavaScript
│       ├── data.js      # Persistência e schema
│       ├── sheet.js     # Lógica da ficha
│       ├── spells.js    # Sistema de magias
│       ├── inventory.js # Sistema de inventário
│       ├── homebrew.js  # Gerenciador homebrew
│       └── constants.js # Dados SRD (raças, classes, magias)
├── package.json
└── .gitignore
```

---

## 🛠 Tecnologias

| | |
|---|---|
| **Electron** | App desktop multiplataforma |
| **HTML/CSS/JS** | Frontend puro, sem frameworks |
| **localStorage** | Persistência local dos dados |
| **JSZip** | Exportação em ZIP com imagens |

---

## 📜 Licença

Projeto pessoal de uso livre. Conteúdo SRD de D&D 5e sob licença OGL da Wizards of the Coast.

---

<div align="center">
  Feito com ⚔ por <a href="https://github.com/GabrielBGarcia">GabrielBGarcia</a>
</div>
