# Grimório — Ficha de RPG

Uma aplicação web moderna para gerenciar fichas de RPG medieval com estética dark minimalista. Perfeita para mestres e jogadores que desejam uma ferramenta simples, funcional e offline.

## 📋 Características

- ✓ Sistema de HP e atributos
- ✓ Gerenciador de inventário completo
- ✓ Biblioteca de magias
- ✓ Sistema de talentos
- ✓ Homebrew manager (crie conteúdo personalizado)
- ✓ Upload e gerenciamento de retratos
- ✓ Exportação de dados em JSON e ZIP
- ✓ Funciona offline (sem necessidade de servidor)

## 🚀 Como Baixar

### Opção 1: Clonar com Git
```bash
git clone https://github.com/seu-usuario/grimorio.git
cd grimorio
```

### Opção 2: Baixar como ZIP
1. Acesse o repositório do projeto
2. Clique no botão **Code** (verde)
3. Selecione **Download ZIP**
4. Extraia o arquivo em uma pasta de sua escolha

## 💻 Como Instalar e Executar

### Requisitos
- Um navegador moderno (Chrome, Firefox, Edge, Safari)
- Nenhuma instalação adicional necessária

### Instalação Rápida

#### No Windows:
```bash
setup.bat
```

#### No macOS/Linux:
```bash
bash setup.sh
```

### Execução Manual

1. Navegue até a pasta do projeto
2. Abra o arquivo `index.html` diretamente no navegador de sua escolha
3. A aplicação iniciará automaticamente

#### Alternativa - Usar um servidor local (recomendado):
```bash
# Com Python 3
python -m http.server 8000

# Com Node.js
npx http-server
```

Então acesse `http://localhost:8000` no seu navegador.

## 📁 Estrutura do Projeto

```
grimorio/
├── index.html              # Página principal da aplicação
├── package.json            # Dependências do projeto
├── setup.bat              # Script de instalação (Windows)
├── setup.sh               # Script de instalação (Unix/Linux)
├── css/                   # Estilos globais
│   ├── components.css
│   └── layout.css
├── js/                    # Scripts principais
│   ├── constants.js
│   ├── data.js
│   ├── homebrew.js
│   ├── inventory.js
│   ├── sheet.js
│   └── spells.js
├── src/                   # Código-fonte adicional
│   ├── importar-magias.html
│   ├── importar-magias.js
│   └── [css e js internos]
├── database/              # Arquivos de banco de dados
├── electron/              # Configurações para desktop (Electron)
└── LEIA-ME.md            # Documentação em português
```

## 🎮 Como Usar

1. **Abra a aplicação** seguindo as instruções acima
2. **Crie sua ficha** preenchendo os dados básicos do personagem
3. **Gerencie recursos:**
   - Atributos e HP na seção principal
   - Inventário para guardar itens
   - Magias para listar seus feitiços
4. **Personalize** usando o Homebrew manager
5. **Exporte sua ficha** em JSON ou ZIP para backup

## 🔧 Desenvolvimento

Se desejar modificar ou contribuir:

```bash
# Instale as dependências
npm install

# Inicie com Electron (desktop)
npm start
```

## 📝 Licença

Verifique o arquivo LICENSE para mais informações.

## 🤝 Suporte

Encontrou um bug? Tem uma sugestão?
- Abra uma issue no repositório
- Envie um pull request com suas melhorias

---

**Versão:** 1.0  
**Última atualização:** Maio de 2026
