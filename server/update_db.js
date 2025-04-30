const db = require('./database');
const fs = require('fs');

// Функция для выполнения миграции
const runMigration = () => {
  console.log('Начинаем обновление базы данных...');
  
  // Проверка существования столбца status
  db.get("PRAGMA table_info(bookings)", [], (err, rows) => {
    if (err) {
      console.error('Ошибка при проверке структуры таблицы:', err);
      process.exit(1);
    }
    
    // Создание бэкапа базы данных перед изменениями
    fs.copyFile('./database.sqlite', './database_backup.sqlite', (err) => {
      if (err) {
        console.error('Ошибка при создании бэкапа:', err);
      } else {
        console.log('Создан бэкап базы данных: database_backup.sqlite');
      }
      
      // Добавление столбца status в таблицу bookings
      db.run("ALTER TABLE bookings ADD COLUMN status TEXT DEFAULT 'confirmed'", (err) => {
        if (err) {
          if (err.message.includes('duplicate column name')) {
            console.log('Столбец status уже существует в таблице bookings');
          } else {
            console.error('Ошибка при добавлении столбца status:', err);
            process.exit(1);
          }
        } else {
          console.log('Столбец status успешно добавлен в таблицу bookings');
        }
        
        // Обновление значений в новом столбце
        db.run("UPDATE bookings SET status = 'confirmed' WHERE status IS NULL", (err) => {
          if (err) {
            console.error('Ошибка при обновлении значений в столбце status:', err);
          } else {
            console.log('Значения по умолчанию для столбца status установлены');
          }
          
          // Выводим структуру таблицы после обновления
          db.all("PRAGMA table_info(bookings)", [], (err, rows) => {
            if (err) {
              console.error('Ошибка при получении структуры таблицы:', err);
            } else {
              console.log('Текущая структура таблицы bookings:');
              console.table(rows);
            }
            
            console.log('Обновление базы данных завершено.');
            process.exit(0);
          });
        });
      });
    });
  });
};

// Запуск миграции
runMigration(); 