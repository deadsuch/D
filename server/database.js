const sqlite3 = require('sqlite3').verbose();

// Создание и подключение к БД
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Ошибка при подключении к БД:', err.message);
  } else {
    console.log('Подключение к SQLite из модуля database.js установлено');
  }
});

module.exports = db; 