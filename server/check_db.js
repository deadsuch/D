const db = require('./database');

// Проверяем структуру таблицы bookings
db.all("PRAGMA table_info(bookings)", [], (err, rows) => {
  if (err) {
    console.error('Ошибка при получении структуры таблицы:', err);
    process.exit(1);
  }
  
  console.log('Структура таблицы bookings:');
  rows.forEach(row => {
    console.log(`${row.cid}: ${row.name} (${row.type}) ${row.notnull ? 'NOT NULL' : ''} ${row.dflt_value ? 'DEFAULT ' + row.dflt_value : ''} ${row.pk ? 'PRIMARY KEY' : ''}`);
  });
  
  // Получаем примеры данных
  db.all("SELECT * FROM bookings LIMIT 5", [], (err, bookings) => {
    if (err) {
      console.error('Ошибка при получении данных из таблицы bookings:', err);
      process.exit(1);
    }
    
    console.log('\nПримеры бронирований:');
    bookings.forEach(booking => {
      console.log(booking);
    });
    
    process.exit(0);
  });
}); 