# Интеграционные тесты сервера бронирования мероприятий

В этом каталоге находятся интеграционные тесты, которые проверяют работу API сервера бронирования мероприятий.

## Список тестов

Всего реализовано 20 интеграционных тестов, охватывающих все основные функции API:

1. Аутентификация (вход, регистрация)
2. Управление мероприятиями (создание, чтение, обновление, удаление)
3. Бронирование мероприятий
4. Проверка прав доступа
5. Управление профилем пользователя
6. Статистика и административные функции

## Как запустить тесты

### Предварительные требования

Для запуска тестов вам потребуется:

1. Node.js (рекомендуется версия 14+)
2. Установленные зависимости проекта (`npm install`)

### Процедура запуска

1. **Шаг 1**: Запустите сервер в отдельном терминале

   ```bash
   npm run dev
   ```

   Сервер должен быть запущен на порту 5000.

2. **Шаг 2**: Запустите тесты

   ```bash
   npm test
   ```

## Решение проблем

### Сервер не запускается

- Проверьте, нет ли уже запущенного процесса, который использует порт 5000
- Убедитесь, что база данных не заблокирована другим процессом
- Проверьте наличие всех зависимостей

### Тесты не проходят

- Убедитесь, что сервер запущен и доступен по адресу http://localhost:5000
- Проверьте, что база данных содержит тестовые данные (администратор с email: admin@example.com)
- Проверьте журнал сервера на наличие ошибок

## Структура тестов

Тесты организованы в последовательном порядке, где каждый тест может зависеть от успешного выполнения предыдущего. Например, тесты на создание бронирования зависят от успешного создания мероприятия и регистрации пользователя.

### Важное примечание

Тесты предназначены для запуска в чистой тестовой среде. Запуск их в производственной базе данных может привести к нежелательным изменениям данных. 