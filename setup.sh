#!/bin/bash
echo ""
echo " ========================================"
echo "  GRIMÓRIO — Setup do App Desktop"
echo " ========================================"
echo ""

# Cria pastas novas
echo "[1/5] Criando pastas..."
mkdir -p src electron database
echo "      OK"

# Move arquivos do frontend para src/
echo "[2/5] Movendo frontend para src/..."
[ -f "index.html" ] && mv index.html src/ && echo "      index.html movido"
[ -d "css" ] && mv css src/ && echo "      pasta css/ movida"
[ -d "js" ] && mv js src/ && echo "      pasta js/ movida"
echo "      OK"

# Cria package.json
echo "[3/5] Criando package.json..."
cat > package.json << 'EOF'
{
  "name": "grimorio",
  "version": "1.0.0",
  "description": "Ficha de D&D — App Desktop Offline",
  "main": "electron/main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder"
  },
  "build": {
    "appId": "com.grimorio.app",
    "productName": "Grimório",
    "files": ["src/**", "electron/**", "database/**"],
    "directories": { "output": "dist" }
  }
}
EOF
echo "      OK"

# Instala dependencias
echo "[4/5] Instalando dependencias (pode demorar)..."
npm install electron better-sqlite3 --save
npm install electron-builder --save-dev
echo "      OK"

echo "[5/5] Pronto!"
echo ""
echo " ========================================"
echo "  Setup concluido! Rode: npm start"
echo " ========================================"
echo ""
