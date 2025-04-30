const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Получение всех бронирований
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';
  
  // Если админ, показываем все бронирования, иначе только пользователя
  const query = isAdmin
    ? `SELECT b.*, e.title as event_title, u.name as user_name 
       FROM bookings b 
       JOIN events e ON b.event_id = e.id 
       JOIN users u ON b.user_id = u.id 
       ORDER BY b.booking_date DESC`
    : `SELECT b.*, e.title as event_title 
       FROM bookings b 
       JOIN events e ON b.event_id = e.id 
       WHERE b.user_id = ? 
       ORDER BY b.booking_date DESC`;
  
  const params = isAdmin ? [] : [userId];

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Ошибка при получении бронирований:', err);
      return res.status(500).json({ message: 'Ошибка сервера при получении бронирований' });
    }
    res.json(rows);
  });
});

// Получение бронирований пользователя
router.get('/user', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  const query = `
    SELECT b.*, e.title as event_title, e.date_time as event_date, e.location as event_location
    FROM bookings b 
    JOIN events e ON b.event_id = e.id 
    WHERE b.user_id = ? 
    ORDER BY b.booking_date DESC
  `;
  
  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error('Ошибка при получении бронирований пользователя:', err);
      return res.status(500).json({ message: 'Ошибка сервера при получении бронирований' });
    }
    res.json(rows);
  });
});

// Создание нового бронирования
router.post('/', authenticateToken, (req, res) => {
  try {
    const { event_id, tickets_count } = req.body;
    const user_id = req.user.id;

    if (!event_id || !tickets_count || tickets_count <= 0) {
      return res.status(400).json({ message: 'Некорректные данные для бронирования' });
    }

    // Получаем информацию о мероприятии
    db.get('SELECT * FROM events WHERE id = ?', [event_id], (err, event) => {
      if (err) {
        console.error('Ошибка при получении мероприятия:', err);
        return res.status(500).json({ message: 'Ошибка сервера при создании бронирования' });
      }
      if (!event) {
        return res.status(404).json({ message: 'Мероприятие не найдено' });
      }
      if (event.available_seats < tickets_count) {
        return res.status(400).json({ message: `Недостаточно свободных мест. Доступно: ${event.available_seats}` });
      }

      // Обновляем количество доступных мест
      const newAvailableSeats = event.available_seats - tickets_count;
      const totalPrice = event.price * tickets_count;

      db.run(
        'UPDATE events SET available_seats = ? WHERE id = ?',
        [newAvailableSeats, event_id],
        function (err) {
          if (err) {
            console.error('Ошибка при обновлении доступных мест:', err);
            return res.status(500).json({ message: 'Ошибка сервера при создании бронирования' });
          }

          // Создаем бронирование
          db.run(
            'INSERT INTO bookings (user_id, event_id, tickets_count, total_price) VALUES (?, ?, ?, ?)',
            [user_id, event_id, tickets_count, totalPrice],
            function (err) {
              if (err) {
                console.error('Ошибка при создании бронирования:', err);
                return res.status(500).json({ message: 'Ошибка сервера при создании бронирования' });
              }

              // Получаем созданное бронирование для возврата
              db.get(
                `SELECT b.*, e.title as event_title 
                 FROM bookings b
                 JOIN events e ON b.event_id = e.id
                 WHERE b.id = ?`,
                [this.lastID],
                (err, booking) => {
                  if (err) {
                    console.error('Ошибка при получении созданного бронирования:', err);
                    return res.status(201).json({
                      message: 'Бронирование успешно создано',
                      id: this.lastID,
                      user_id,
                      event_id,
                      tickets_count,
                      total_price: totalPrice,
                      event_title: event.title
                    });
                  }
                  
                  res.status(201).json({
                    message: 'Бронирование успешно создано',
                    ...booking
                  });
                }
              );
            }
          );
        }
      );
    });
  } catch (error) {
    console.error('Ошибка при создании бронирования:', error);
    res.status(500).json({ message: 'Ошибка сервера при создании бронирования' });
  }
});

// Получение бронирования по ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';
  
  // Запрос к базе данных для получения информации о бронировании
  let query = `
    SELECT b.*, 
           e.title as event_title, 
           e.date_time as event_date, 
           e.location as event_location,
           e.image_url as event_image,
           u.name as user_name,
           u.email as user_email
    FROM bookings b
    JOIN events e ON b.event_id = e.id
    JOIN users u ON b.user_id = u.id
    WHERE b.id = ?
  `;
  
  // Если пользователь не администратор, проверяем, что бронирование принадлежит ему
  if (!isAdmin) {
    query += ' AND b.user_id = ?';
  }
  
  const params = isAdmin ? [id] : [id, userId];
  
  db.get(query, params, (err, booking) => {
    if (err) {
      console.error('Ошибка при получении бронирования:', err);
      return res.status(500).json({ message: 'Ошибка сервера при получении бронирования' });
    }
    
    if (!booking) {
      return res.status(404).json({ message: 'Бронирование не найдено' });
    }
    
    res.json(booking);
  });
});

// Отмена бронирования
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    // Получаем бронирование
    const bookingQuery = isAdmin
      ? 'SELECT * FROM bookings WHERE id = ?'
      : 'SELECT * FROM bookings WHERE id = ? AND user_id = ?';
    
    const bookingParams = isAdmin ? [id] : [id, userId];
    
    db.get(bookingQuery, bookingParams, (err, booking) => {
      if (err) {
        console.error('Ошибка при получении бронирования:', err);
        return res.status(500).json({ message: 'Ошибка сервера при отмене бронирования' });
      }
      if (!booking) {
        return res.status(404).json({ message: 'Бронирование не найдено' });
      }
      
      // Возвращаем билеты в доступные места
      db.run(
        'UPDATE events SET available_seats = available_seats + ? WHERE id = ?',
        [booking.tickets_count, booking.event_id],
        (err) => {
          if (err) {
            console.error('Ошибка при обновлении мест:', err);
            return res.status(500).json({ message: 'Ошибка сервера при отмене бронирования' });
          }
          
          // Удаляем бронирование
          db.run('DELETE FROM bookings WHERE id = ?', [id], function (err) {
            if (err) {
              console.error('Ошибка при удалении бронирования:', err);
              return res.status(500).json({ message: 'Ошибка сервера при отмене бронирования' });
            }
            res.json({ message: 'Бронирование успешно отменено' });
          });
        }
      );
    });
  } catch (error) {
    console.error('Ошибка при отмене бронирования:', error);
    res.status(500).json({ message: 'Ошибка сервера при отмене бронирования' });
  }
});

// Отправка билета на email
router.post('/:id/send-ticket', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  // Проверяем, существует ли бронирование
  const bookingQuery = `
    SELECT b.*, e.title as event_title, e.date_time, e.location, e.image_url
    FROM bookings b
    JOIN events e ON b.event_id = e.id
    WHERE b.id = ? AND b.user_id = ?
  `;
  
  db.get(bookingQuery, [id, userId], (err, booking) => {
    if (err) {
      console.error('Ошибка при получении бронирования:', err);
      return res.status(500).json({ message: 'Ошибка сервера при отправке билета' });
    }
    
    if (!booking) {
      return res.status(404).json({ message: 'Бронирование не найдено' });
    }
    
    // Получаем email пользователя
    db.get('SELECT email, name FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) {
        console.error('Ошибка при получении данных пользователя:', err);
        return res.status(500).json({ message: 'Ошибка сервера при отправке билета' });
      }
      
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
      
      const { email, name } = user;
      
      // Отправляем электронное письмо с билетом
      // В реальном проекте здесь будет код отправки email с использованием nodemailer или другой библиотеки
      
      // Заглушка для демонстрации
      console.log(`Отправка билета на email ${email} для пользователя ${name}`);
      console.log(`Бронирование #${booking.id} для мероприятия "${booking.event_title}"`);
      console.log(`Дата мероприятия: ${new Date(booking.date_time).toLocaleString('ru-RU')}`);
      console.log(`Количество билетов: ${booking.tickets_count}`);
      console.log(`Общая стоимость: ${booking.total_price} ₽`);
      
      // Обновляем статус билета, чтобы отметить, что он был отправлен
      db.run(
        'UPDATE bookings SET ticket_sent = 1 WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            console.error('Ошибка при обновлении статуса билета:', err);
            return res.status(500).json({ message: 'Ошибка сервера при отправке билета' });
          }
          
          res.status(200).json({ 
            message: 'Билет успешно отправлен на указанный адрес электронной почты',
            email
          });
        }
      );
    });
  });
});

// Обновление бронирования (только для администраторов)
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { tickets_count, status } = req.body;
    const isAdmin = req.user.role === 'admin';
    
    // Проверяем, что пользователь является администратором
    if (!isAdmin) {
      return res.status(403).json({ message: 'Доступ запрещен. Требуются права администратора.' });
    }
    
    // Проверяем валидность входных данных
    if (!tickets_count || isNaN(parseInt(tickets_count)) || parseInt(tickets_count) <= 0) {
      return res.status(400).json({ message: 'Количество билетов должно быть положительным числом' });
    }
    
    // Убедимся, что бронирование существует
    db.get('SELECT * FROM bookings WHERE id = ?', [id], (err, booking) => {
      if (err) {
        console.error('Ошибка при получении бронирования:', err);
        return res.status(500).json({ message: 'Ошибка сервера при обновлении бронирования' });
      }
      
      if (!booking) {
        return res.status(404).json({ message: 'Бронирование не найдено' });
      }
      
      // Получаем информацию о мероприятии для расчета общей стоимости
      db.get('SELECT price, available_seats FROM events WHERE id = ?', [booking.event_id], (err, event) => {
        if (err) {
          console.error('Ошибка при получении данных мероприятия:', err);
          return res.status(500).json({ message: 'Ошибка сервера при обновлении бронирования' });
        }
        
        if (!event) {
          return res.status(404).json({ message: 'Мероприятие не найдено' });
        }
        
        // Проверяем доступность мест, если количество билетов увеличивается
        const numericTicketsCount = parseInt(tickets_count);
        const additionalTickets = numericTicketsCount - booking.tickets_count;
        if (additionalTickets > 0 && additionalTickets > event.available_seats) {
          return res.status(400).json({ 
            message: `Недостаточно мест. Доступно: ${event.available_seats}` 
          });
        }
        
        // Проверяем валидность статуса
        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
        if (status && !validStatuses.includes(status)) {
          return res.status(400).json({
            message: `Недопустимый статус. Допустимые значения: ${validStatuses.join(', ')}`
          });
        }
        
        // Рассчитываем новую общую стоимость
        const total_price = numericTicketsCount * event.price;
        
        // Обновляем бронирование
        const updateBookingQuery = `
          UPDATE bookings 
          SET tickets_count = ?, 
              status = ?,
              total_price = ?
          WHERE id = ?
        `;
        
        db.run(updateBookingQuery, [numericTicketsCount, status, total_price, id], function(err) {
          if (err) {
            console.error('Ошибка при обновлении бронирования:', err);
            return res.status(500).json({ message: 'Ошибка сервера при обновлении бронирования' });
          }
          
          // Обновляем доступные места для мероприятия
          if (additionalTickets !== 0) {
            const updateEventQuery = `
              UPDATE events 
              SET available_seats = available_seats - ? 
              WHERE id = ?
            `;
            
            db.run(updateEventQuery, [additionalTickets, booking.event_id], function(err) {
              if (err) {
                console.error('Ошибка при обновлении доступных мест:', err);
                // Откатываем изменения в бронировании, если не удалось обновить доступные места
                db.run(
                  'UPDATE bookings SET tickets_count = ?, status = ?, total_price = ? WHERE id = ?',
                  [booking.tickets_count, booking.status, booking.total_price, id],
                  (rollbackErr) => {
                    if (rollbackErr) {
                      console.error('Ошибка при откате изменений бронирования:', rollbackErr);
                    }
                  }
                );
                return res.status(500).json({ message: 'Ошибка сервера при обновлении доступных мест' });
              }
              
              // Получаем обновленное бронирование для возврата в ответе
              db.get('SELECT * FROM bookings WHERE id = ?', [id], (err, updatedBooking) => {
                if (err) {
                  console.error('Ошибка при получении обновленного бронирования:', err);
                  return res.status(200).json({ 
                    message: 'Бронирование успешно обновлено',
                    booking_id: id
                  });
                }
                
                res.status(200).json({ 
                  message: 'Бронирование успешно обновлено',
                  booking_id: id,
                  booking: updatedBooking
                });
              });
            });
          } else {
            // Если количество мест не изменилось, сразу возвращаем результат
            db.get('SELECT * FROM bookings WHERE id = ?', [id], (err, updatedBooking) => {
              if (err) {
                console.error('Ошибка при получении обновленного бронирования:', err);
                return res.status(200).json({ 
                  message: 'Бронирование успешно обновлено',
                  booking_id: id
                });
              }
              
              res.status(200).json({ 
                message: 'Бронирование успешно обновлено',
                booking_id: id,
                booking: updatedBooking
              });
            });
          }
        });
      });
    });
  } catch (error) {
    console.error('Непредвиденная ошибка при обновлении бронирования:', error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении бронирования' });
  }
});

module.exports = router; 