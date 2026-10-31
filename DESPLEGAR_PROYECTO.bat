@echo off
title Lanzador de Bibliometria UQ
color 0A

echo ========================================================
echo        LANZADOR DEL PROYECTO BIBLIOMETRIA UQ
echo ========================================================
echo.

set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=C:\Program Files\nodejs;%JAVA_HOME%\bin;%PATH%

echo [1/3] Iniciando el Backend Spring Boot en el puerto 8080...
start "Backend Spring Boot (8080)" cmd /k "cd /d "%~dp0back" && .\mvnw.cmd spring-boot:run"

echo Esperando 10 segundos para que Spring Boot inicialice...
timeout /t 10 /nobreak >nul

echo [2/3] Iniciando el Frontend Vite en el puerto 5173...
start "Frontend Vite (5173)" cmd /k "cd /d "%~dp0front" && npm run dev -- --host 0.0.0.0"

echo Esperando 5 segundos para que Vite este listo...
timeout /t 5 /nobreak >nul

echo [3/3] Abriendo el Tunel Publico con Localtunnel...
echo.
echo ========================================================
echo  ATENCION: Copia la URL que aparecera a continuacion
echo  (Ejemplo: https://xxxx-xxxx-xxxx.loca.lt)
echo  y pasasela al profesor o abrela en tu navegador.
echo ========================================================
echo.

call npx localtunnel --port 5173 --local-host 127.0.0.1

pause
