@echo off
title Lanzador de Bibliometria UQ
color 0A

echo ========================================================
echo        LANZADOR DEL PROYECTO BIBLIOMETRIA UQ
echo ========================================================
echo.

set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=C:\Program Files\nodejs;%JAVA_HOME%\bin;%PATH%

echo [1/3] Compilando el Frontend para produccion...
cd /d "%~dp0front"
call npm run build
if %errorlevel% neq 0 (
    echo Error al compilar el frontend.
    pause
    exit /b
)

echo [2/3] Iniciando el Backend Spring Boot en el puerto 8080...
start "Backend Spring Boot (8080)" cmd /k "cd /d "%~dp0back" && .\mvnw.cmd spring-boot:run"

echo Esperando 8 segundos para que Spring Boot inicialice...
timeout /t 8 /nobreak >nul

echo [3/3] Iniciando el Frontend Preview en el puerto 5173...
start "Frontend Preview (5173)" cmd /k "cd /d "%~dp0front" && npm run preview -- --port 5173 --host 0.0.0.0"

echo Esperando 4 segundos...
timeout /t 4 /nobreak >nul

echo Abriendo el Tunel Publico FIJO con Localtunnel...
echo.
echo ========================================================
echo  ENLACE FIJO DEL PROYECTO:
echo  https://bibliometria-uq-2026.loca.lt
echo ========================================================
echo.

call npx localtunnel --port 5173 --local-host 127.0.0.1 --subdomain bibliometria-uq-2026

pause
