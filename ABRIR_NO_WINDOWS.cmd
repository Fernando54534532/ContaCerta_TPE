@echo off
chcp 65001 >nul
title ContaCerta - TPE
cd /d "%~dp0"
echo =========================================
echo          ContaCerta - TPE
 echo =========================================
echo.
where node >nul 2>&1
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado. Instale a versao 20 ou superior.
  echo https://nodejs.org/
  pause
  exit /b 1
)
echo Instalando/verificando dependencias...
call npm.cmd install
if errorlevel 1 (
  echo.
  echo [ERRO] Nao foi possivel instalar as dependencias.
  echo Verifique sua internet e a mensagem de erro acima.
  pause
  exit /b 1
)
echo.
echo Iniciando aplicativo. Abra http://localhost:4200 no navegador.
echo Para fechar, pressione Ctrl+C nesta janela.
call npm.cmd start
pause
