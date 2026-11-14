@echo off
setlocal
cd /d "%~dp0"
echo ================================================
echo   CONTACERTA - ATUALIZAR O APP ANDROID
echo ================================================
if not exist "android\" (
  echo.
  echo Pasta android nao encontrada.
  echo Use o projeto original com a pasta android ja configurada.
  echo Copie este pacote POR CIMA da pasta antiga, sem apagar a pasta android.
  pause
  exit /b 1
)
where npm.cmd >nul 2>&1
if errorlevel 1 (
  echo Node.js / npm nao encontrado. Instale Node.js LTS.
  pause
  exit /b 1
)
call npm.cmd run build
if errorlevel 1 (
  echo.
  echo Falha ao gerar a versao web. Consulte o erro acima.
  pause
  exit /b 1
)
call npx.cmd cap sync android
if errorlevel 1 (
  echo.
  echo Falha ao sincronizar Android. Consulte o erro acima.
  pause
  exit /b 1
)
echo.
echo Atualizacao concluida. Abra Android Studio e clique Run ou Build APK.
pause
