@echo off
echo.
echo  ========================================
echo   GRIMORIO — Setup do App Desktop
echo  ========================================
echo.

REM Cria pastas novas
echo [1/5] Criando pastas...
if not exist "src" mkdir src
if not exist "electron" mkdir electron
if not exist "database" mkdir database
echo       OK

REM Move arquivos do frontend para src/
REM (so move se ainda nao estiverem la)
echo [2/5] Movendo frontend para src/...
if exist "index.html" (
    move /Y "index.html" "src\index.html" >nul 2>&1
    echo       index.html movido
)
if exist "css" (
    if not exist "src\css" (
        xcopy /E /I /Q "css" "src\css" >nul 2>&1
        rmdir /S /Q "css" >nul 2>&1
    )
    echo       pasta css/ movida
)
if exist "js" (
    if not exist "src\js" (
        xcopy /E /I /Q "js" "src\js" >nul 2>&1
        rmdir /S /Q "js" >nul 2>&1
    )
    echo       pasta js/ movida
)
echo       OK

REM Cria package.json
echo [3/5] Criando package.json...
(
echo {
echo   "name": "grimorio",
echo   "version": "1.0.0",
echo   "description": "Ficha de D^&D — App Desktop Offline",
echo   "main": "electron/main.js",
echo   "scripts": {
echo     "start": "electron .",
echo     "build": "electron-builder"
echo   },
echo   "build": {
echo     "appId": "com.grimorio.app",
echo     "productName": "Grimorio",
echo     "files": ["src/**", "electron/**", "database/**"],
echo     "directories": { "output": "dist" }
echo   }
echo }
) > package.json
echo       OK

REM Instala dependencias
echo [4/5] Instalando dependencias (pode demorar)...
call npm install electron better-sqlite3 --save
call npm install electron-builder --save-dev
echo       OK

echo [5/5] Copiando arquivos do Electron...
echo       (Copie manualmente os arquivos .js gerados)
echo       OK

echo.
echo  ========================================
echo   Setup concluido! Rode: npm start
echo  ========================================
echo.
pause
