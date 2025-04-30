const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./database'); // Импортируем базу данных из модуля

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'event-booking-secret-key'; // В реальном проекте храните в .env

// Middleware
// Настраиваем CORS для работы как с локальной разработкой, так и с Docker
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:80", "http://localhost"],
  credentials: true
}));
app.use(express.json());

// Инициализация базы данных
function initializeDatabase() {
  db.serialize(() => {
    // Таблица пользователей
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK (role IN ('client', 'admin')) NOT NULL DEFAULT 'client',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Таблица мероприятий
    db.run(`CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      date_time DATETIME NOT NULL,
      location TEXT NOT NULL,
      total_seats INTEGER NOT NULL,
      available_seats INTEGER NOT NULL,
      price REAL NOT NULL,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Таблица бронирований
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      tickets_count INTEGER NOT NULL,
      total_price REAL NOT NULL,
      status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'confirmed',
      ticket_sent INTEGER DEFAULT 0,
      booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (event_id) REFERENCES events (id)
    )`);

    // Создаем администратора по умолчанию, если его нет
    const adminEmail = 'admin@example.com';
    db.get('SELECT id FROM users WHERE email = ?', [adminEmail], async (err, row) => {
      if (err) {
        console.error('Ошибка при проверке администратора:', err.message);
      } else if (!row) {
        // Создаем админа
        const hashedPassword = await bcrypt.hash('admin123', 10);
        db.run(
          'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
          ['Администратор', adminEmail, hashedPassword, 'admin'],
          function (err) {
            if (err) {
              console.error('Ошибка при создании администратора:', err.message);
            } else {
              console.log('Администратор создан с ID:', this.lastID);
            }
          }
        );
      }
    });

    // Добавляем тестовые мероприятия, если их нет
    db.get('SELECT COUNT(*) as count FROM events', [], (err, row) => {
      if (err) {
        console.error('Ошибка при проверке мероприятий:', err.message);
        return;
      }

      if (row.count === 0) {
        console.log('Добавление тестовых мероприятий...');
        
        // Массив тестовых мероприятий
        const testEvents = [
          {
            title: 'Концерт "Классика под звездами"',
            description: 'Насладитесь величайшими произведениями классической музыки в исполнении симфонического оркестра под открытым ночным небом. Вас ждут произведения Моцарта, Бетховена, Чайковского и других великих композиторов.',
            date_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // через неделю
            location: 'Центральный парк, Главная сцена',
            total_seats: 500,
            available_seats: 500,
            price: 1500,
            image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
          },
          {
            title: 'Фестиваль современного искусства',
            description: 'Трехдневный фестиваль современного искусства, включающий выставки, перформансы, лекции и мастер-классы от ведущих художников и кураторов. Окунитесь в мир инноваций и творческих экспериментов.',
            date_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // через две недели
            location: 'Музей современного искусства',
            total_seats: 350,
            available_seats: 350,
            price: 1200,
            image_url: 'https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
          },
          {
            title: 'Театральная премьера "Тени прошлого"',
            description: 'Драматическая постановка по мотивам бестселлера Александра Волкова. История о сложных семейных отношениях, тайнах прошлого и поиске собственного пути. В главных ролях: Михаил Сергеев и Анна Петрова.',
            date_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // через 5 дней
            location: 'Драматический театр им. А.С. Пушкина',
            total_seats: 200,
            available_seats: 200,
            price: 2500,
            image_url: 'https://images.unsplash.com/photo-1503095396549-807759245b35?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
          },
          {
            title: 'Мастер-класс по гончарному искусству',
            description: 'Приглашаем на творческий мастер-класс по гончарному мастерству от известного керамиста Елены Морозовой. Вы научитесь работать на гончарном круге и создадите свое первое изделие из глины, которое сможете забрать с собой после обжига.',
            date_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // через 3 дня
            location: 'Творческая студия "Глиняный дворик"',
            total_seats: 15,
            available_seats: 15,
            price: 3500,
            image_url: 'https://images.unsplash.com/photo-1556367625-b0c725b4b391?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
          },
          {
            title: 'Бизнес-конференция "Инновации в маркетинге"',
            description: 'Ежегодная конференция для предпринимателей, маркетологов и руководителей. Ведущие эксперты рынка поделятся актуальными трендами, стратегиями и практическими кейсами успешного маркетинга в новых экономических условиях.',
            date_time: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // через 3 недели
            location: 'Бизнес-центр "Панорама", Конференц-зал "Премиум"',
            total_seats: 150,
            available_seats: 150,
            price: 7500,
            image_url: 'https://images.unsplash.com/photo-1560523159-4a9692d222f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
          },
          {
            title: 'Джазовый вечер с трио "Black Notes"',
            description: 'Вечер живой джазовой музыки в исполнении знаменитого трио "Black Notes". В программе: классические джазовые композиции и авторские произведения. Специальный гость - вокалистка Мария Станиславская.',
            date_time: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // через 10 дней
            location: 'Джаз-клуб "Blue Bird"',
            total_seats: 80,
            available_seats: 80,
            price: 2000,
            image_url: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
          },
          {
            title: 'Кулинарный мастер-класс "Секреты итальянской кухни"',
            description: 'Погрузитесь в мир итальянской кухни с шеф-поваром Марко Росси. Вы научитесь готовить настоящую домашнюю пасту, соус карбонара и классический тирамису. Все необходимые ингредиенты включены в стоимость.',
            date_time: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // через 4 дня
            location: 'Кулинарная студия "Bon Appetit"',
            total_seats: 20,
            available_seats: 20,
            price: 4500,
            image_url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
          },
          {
            title: 'Выставка "Загадки древних цивилизаций"',
            description: 'Уникальная экспозиция артефактов древних цивилизаций из коллекций нескольких мировых музеев. Вы увидите редчайшие экспонаты: древнеегипетские папирусы, месопотамские таблички, предметы искусства инков и майя.',
            date_time: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // через 8 дней
            location: 'Исторический музей, Главный выставочный зал',
            total_seats: 300,
            available_seats: 300,
            price: 900,
            image_url: 'https://images.unsplash.com/photo-1560416313-414b33c856a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
          }
        ];

        // Вставляем тестовые мероприятия в базу данных
        const stmt = db.prepare(`
          INSERT INTO events 
          (title, description, date_time, location, total_seats, available_seats, price, image_url) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        testEvents.forEach(event => {
          stmt.run(
            event.title,
            event.description,
            event.date_time,
            event.location,
            event.total_seats,
            event.available_seats,
            event.price,
            event.image_url
          );
        });

        stmt.finalize();
        console.log('Тестовые мероприятия добавлены успешно!');
      }
    });
  });
}

// Вызываем инициализацию базы данных
initializeDatabase();

// Middleware для проверки авторизации
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Требуется авторизация' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Ошибка верификации токена:', err.message);
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// Middleware для проверки роли администратора
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Недостаточно прав' });
  }
  next();
};

// Middleware теперь импортируется из middleware/auth.js
const { authenticateToken: authMiddleware, isAdmin: adminMiddleware } = require('./middleware/auth');

// Экспортируем middleware для использования в других файлах
// exports.authenticateToken = authenticateToken;
// exports.isAdmin = isAdmin;

// Маршруты аутентификации
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }

    // Проверяем, существует ли пользователь с таким email
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при регистрации' });
      }
      if (row) {
        return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
      }

      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(password, 10);

      // Создаем пользователя
      db.run(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'Ошибка при создании пользователя' });
          }

          const token = jwt.sign(
            { id: this.lastID, email, role: 'client' },
            JWT_SECRET,
            { expiresIn: '24h' }
          );

          res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            token,
            user: {
              id: this.lastID,
              name,
              email,
              role: 'client'
            }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    // Проверяем, существует ли пользователь
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при входе' });
      }
      if (!user) {
        return res.status(400).json({ error: 'Неверный email или пароль' });
      }

      // Проверяем пароль
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({ error: 'Неверный email или пароль' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Вход выполнен успешно',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// API для получения всех мероприятий
app.get('/api/events', (req, res) => {
  db.all('SELECT * FROM events ORDER BY date_time', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при получении мероприятий' });
    }
    res.json(rows);
  });
});

// API для получения одного мероприятия
app.get('/api/events/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM events WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при получении мероприятия' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Мероприятие не найдено' });
    }
    res.json(row);
  });
});

// API для создания мероприятия (только для админа)
app.post('/api/events', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { title, description, date_time, location, total_seats, price, image_url } = req.body;

    if (!title || !date_time || !location || !total_seats || !price) {
      return res.status(400).json({ error: 'Все обязательные поля должны быть заполнены' });
    }

    db.run(
      `INSERT INTO events 
      (title, description, date_time, location, total_seats, available_seats, price, image_url) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, date_time, location, total_seats, total_seats, price, image_url],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Ошибка при создании мероприятия' });
        }
        res.status(201).json({
          id: this.lastID,
          title,
          description,
          date_time,
          location,
          total_seats,
          available_seats: total_seats,
          price,
          image_url
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// API для обновления мероприятия (только для админа)
app.put('/api/events/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date_time, location, total_seats, available_seats, price, image_url } = req.body;

    if (!title || !date_time || !location || !total_seats || !price) {
      return res.status(400).json({ error: 'Все обязательные поля должны быть заполнены' });
    }

    db.run(
      `UPDATE events 
      SET title=?, description=?, date_time=?, location=?, total_seats=?, available_seats=?, price=?, image_url=?
      WHERE id=?`,
      [title, description, date_time, location, total_seats, available_seats, price, image_url, id],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Ошибка при обновлении мероприятия' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Мероприятие не найдено' });
        }
        res.json({
          id,
          title,
          description,
          date_time,
          location,
          total_seats,
          available_seats,
          price,
          image_url
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.delete('/api/events/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;

    db.run('DELETE FROM events WHERE id = ?', [id], function (err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при удалении мероприятия' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Мероприятие не найдено' });
      }
      res.json({ message: 'Мероприятие успешно удалено' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// API для получения информации о пользователе
app.get('/api/users/profile', authMiddleware, (req, res) => {
  const userId = req.user.id;
  
  db.get('SELECT id, name, email, role FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при получении профиля' });
    }
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json(user);
  });
});

// API для обновления профиля
app.put('/api/users/profile', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Имя и email обязательны' });
    }
    
    // Проверяем, занят ли email
    db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при проверке email' });
      }
      if (row) {
        return res.status(400).json({ error: 'Email уже используется' });
      }
      
      // Обновляем профиль
      db.run(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [name, email, userId],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'Ошибка при обновлении профиля' });
          }
          res.json({
            id: userId,
            name,
            email,
            role: req.user.role
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// API для смены пароля
app.put('/api/users/change-password', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Текущий и новый пароли обязательны' });
    }
    
    // Получаем текущий пароль пользователя
    db.get('SELECT password FROM users WHERE id = ?', [userId], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при проверке пароля' });
      }
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }
      
      // Проверяем текущий пароль
      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatch) {
        return res.status(400).json({ error: 'Неверный текущий пароль' });
      }
      
      // Хешируем новый пароль
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Обновляем пароль
      db.run(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'Ошибка при обновлении пароля' });
          }
          res.json({ message: 'Пароль успешно изменен' });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// API для получения статистики (только для админов)
app.get('/api/stats', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const stats = {};
    
    // Получаем общее количество пользователей
    db.get('SELECT COUNT(*) as count FROM users WHERE role = "client"', [], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при получении статистики' });
      }
      stats.totalUsers = row.count;
      
      // Получаем общее количество мероприятий
      db.get('SELECT COUNT(*) as count FROM events', [], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Ошибка при получении статистики' });
        }
        stats.totalEvents = row.count;
        
        // Получаем общее количество бронирований
        db.get('SELECT COUNT(*) as count FROM bookings', [], (err, row) => {
          if (err) {
            return res.status(500).json({ error: 'Ошибка при получении статистики' });
          }
          stats.totalBookings = row.count;
          
          // Получаем общую выручку
          db.get('SELECT SUM(total_price) as total FROM bookings', [], (err, row) => {
            if (err) {
              return res.status(500).json({ error: 'Ошибка при получении статистики' });
            }
            stats.totalRevenue = row.total || 0;
            
            res.json(stats);
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Подключение маршрутизаторов
const bookingsRouter = require('./routes/bookings');
app.use('/api/bookings', bookingsRouter);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 