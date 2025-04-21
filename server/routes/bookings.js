const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

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
  const { id } = req.params;
  const { tickets_count, status } = req.body;
  const isAdmin = req.user.role === 'admin';
  
  // Проверяем, что пользователь является администратором
  if (!isAdmin) {
    return res.status(403).json({ message: 'Доступ запрещен. Требуются права администратора.' });
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
      const additionalTickets = tickets_count - booking.tickets_count;
      if (additionalTickets > 0 && additionalTickets > event.available_seats) {
        return res.status(400).json({ 
          message: `Недостаточно мест. Доступно: ${event.available_seats}` 
        });
      }
      
      // Рассчитываем новую общую стоимость
      const total_price = tickets_count * event.price;
      
      // Обновляем бронирование
      const updateBookingQuery = `
        UPDATE bookings 
        SET tickets_count = ?, 
            status = ?,
            total_price = ?
        WHERE id = ?
      `;
      
      db.run(updateBookingQuery, [tickets_count, status, total_price, id], function(err) {
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
              // Продолжаем выполнение, так как бронирование уже обновлено
            }
          });
        }
        
        res.status(200).json({ 
          message: 'Бронирование успешно обновлено',
          booking_id: id
        });
      });
    });
  });
});

module.exports = router; 