import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingsAPI, eventsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const BookingEditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [booking, setBooking] = useState(null);
  const [event, setEvent] = useState(null);
  
  const [formData, setFormData] = useState({
    tickets_count: '',
    status: ''
  });
  
  // Проверяем права администратора
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);
  
  // Загружаем данные бронирования и мероприятия
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const bookingData = await bookingsAPI.getById(id);
        setBooking(bookingData);
        
        // Загружаем информацию о мероприятии для проверки доступных мест
        const eventData = await eventsAPI.getById(bookingData.event_id);
        setEvent(eventData);
        
        setFormData({
          tickets_count: bookingData.tickets_count,
          status: bookingData.status || 'confirmed'
        });
        
        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке данных: ' + err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    
    try {
      // Проверяем, что количество билетов - положительное число
      const numericTicketsCount = parseInt(formData.tickets_count);
      if (isNaN(numericTicketsCount) || numericTicketsCount <= 0) {
        throw new Error('Количество билетов должно быть положительным числом');
      }
      
      // Проверяем, не превышает ли новое количество билетов доступное количество мест
      const additionalTickets = numericTicketsCount - booking.tickets_count;
      if (additionalTickets > 0 && additionalTickets > event.available_seats) {
        throw new Error(`Недостаточно мест. Доступно: ${event.available_seats}`);
      }
      
      // Обновляем бронирование, явно преобразуя все данные в правильные типы
      const updatedBooking = await bookingsAPI.update(id, {
        tickets_count: numericTicketsCount,
        status: formData.status || 'confirmed'
      });
      
      console.log('Ответ сервера:', updatedBooking);
      
      // Обновляем локальную информацию о бронировании
      setBooking({
        ...booking,
        tickets_count: numericTicketsCount,
        status: formData.status,
        total_price: numericTicketsCount * event.price
      });
      
      // Обновляем локальную информацию о мероприятии
      if (additionalTickets !== 0) {
        setEvent({
          ...event,
          available_seats: event.available_seats - additionalTickets
        });
      }
      
      setSuccess('Бронирование успешно обновлено');
      // Перенаправляем на страницу списка бронирований через 2 секунды
      setTimeout(() => navigate('/bookings'), 2000);
    } catch (err) {
      console.error('Ошибка при обновлении бронирования:', err);
      setError(err.message || 'Произошла ошибка при обновлении бронирования');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className="text-center">Загрузка...</div>;
  }
  
  if (!booking) {
    return <div className="alert alert-danger">Бронирование не найдено</div>;
  }
  
  return (
    <div className="booking-edit-container">
      <h2>Редактирование бронирования</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Информация о бронировании</h5>
          <div className="row mb-3">
            <div className="col-md-6">
              <p><strong>ID:</strong> {booking.id}</p>
              <p><strong>Мероприятие:</strong> {booking.event_title}</p>
              <p><strong>Пользователь:</strong> {booking.user_name}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Дата бронирования:</strong> {new Date(booking.booking_date).toLocaleString()}</p>
              <p><strong>Цена за билет:</strong> {event.price} ₽</p>
              <p><strong>Доступно мест:</strong> {event.available_seats}</p>
            </div>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="tickets_count">Количество билетов*</label>
              <input
                type="number"
                id="tickets_count"
                name="tickets_count"
                value={formData.tickets_count}
                onChange={handleChange}
                className="form-control"
                min="1"
                required
              />
              <small className="form-text text-muted">
                Текущее количество: {booking.tickets_count}
              </small>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="status">Статус бронирования*</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="confirmed">Подтверждено</option>
                <option value="cancelled">Отменено</option>
                <option value="completed">Завершено</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="form-group mb-3">
          <label>Общая стоимость</label>
          <div className="form-control bg-light">
            {(formData.tickets_count * event.price).toFixed(2)} ₽
          </div>
          <small className="form-text text-muted">
            Рассчитывается автоматически: {formData.tickets_count} билетов × {event.price} ₽
          </small>
        </div>
        
        <div className="d-flex justify-content-between mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate('/bookings')}
          >
            Отмена
          </button>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingEditForm; 