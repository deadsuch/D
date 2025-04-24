@echo off

echo Запуск проекта в режиме разработки

REM Проверяем, запущен ли уже сервер на порту 5000
netstat -ano | findstr :5000 > nul
if %errorlevel% equ 0 (
    echo Сервер уже запущен на порту 5000
) else (
    echo Запускаем сервер на порту 5000...
    start cmd /k "cd server && npm run dev"
    REM Ждем несколько секунд, чтобы сервер успел запуститься
    timeout /t 5 /nobreak > nul
)

echo Запускаем клиент на порту 3000...
cd client && npm start 