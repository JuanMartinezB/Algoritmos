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
start "Backend Spring Boot" cmd /k "cd /d "%~dp0back" && .\mvnw.cmd spring-boot:run"

echo Esperando 8 segundos para que Spring Boot inicialice...
timeout /t 8 /nobreak >nul

echo [2/3] Iniciando el Frontend Vite en el puerto 5173...
start "Frontend Vite" cmd /k "cd /d "%~dp0front" && npm run dev"

echo Esperando 4 segundos para que Vite este listo...
timeout /t 4 /nobreak >nul

echo [3/3] Abriendo el Tunel Publico con Localtunnel...
echo.
echo ========================================================
echo  ATENCION: Copia la URL que aparecera a continuacion
echo  (Ejemplo: https://bright-pandas-sing.loca.lt)
echo  y pasasela al profesor o abrela en tu navegador.
echo ========================================================
echo.

call npx localtunnel --port 5173

pause
