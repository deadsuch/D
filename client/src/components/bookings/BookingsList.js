import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const BookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await bookingsAPI.getAll();
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, []);

  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Получение текста статуса бронирования
  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Подтверждено';
      case 'cancelled':
        return 'Отменено';
      case 'completed':
        return 'Завершено';
      case 'pending':
        return 'Ожидает подтверждения';
      default:
        return 'Подтверждено';
    }
  };
  
  // Получение класса для отображения статуса
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      case 'completed':
        return 'bg-info';
      case 'pending':
        return 'bg-warning';
      default:
        return 'bg-success';
    }
  };

  // Отмена бронирования
  const handleCancelBooking = async (id) => {
    if (window.confirm('Вы уверены, что хотите отменить это бронирование?')) {
      try {
        await bookingsAPI.cancel(id);
        setBookings(bookings.filter(booking => booking.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) {
    return <div className="text-center">Загрузка...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="bookings-container">
        <h2>Мои бронирования</h2>
        <div className="alert alert-info">У вас пока нет бронирований.</div>
        <Link to="/events" className="btn btn-primary">
          Перейти к мероприятиям
        </Link>
      </div>
    );
  }

  return (
    <div className="bookings-container">
      <h2>{isAdmin ? 'Все бронирования' : 'Мои бронирования'}</h2>
      
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Мероприятие</th>
              {isAdmin && <th>Пользователь</th>}
              <th>Количество билетов</th>
              <th>Общая стоимость</th>
              <th>Дата бронирования</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <tr key={booking.id}>
                <td>{index + 1}</td>
                <td>
                  <Link to={`/events/${booking.event_id}`}>
                    {booking.event_title}
                  </Link>
                </td>
                {isAdmin && <td>{booking.user_name}</td>}
                <td>{booking.tickets_count}</td>
                <td>{booking.total_price} ₽</td>
                <td>{formatDate(booking.booking_date)}</td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                    {getStatusText(booking.status)}
                  </span>
                </td>
                <td>
                  <Link 
                    to={`/bookings/${booking.id}/ticket`} 
                    className="btn btn-outline-primary btn-sm me-2"
                  >
                    <i className="bi bi-ticket-detailed me-1"></i>
                    Билет
                  </Link>
                  {isAdmin && (
                    <Link 
                      to={`/bookings/${booking.id}/edit`} 
                      className="btn btn-outline-secondary btn-sm me-2"
                    >
                      <i className="bi bi-pencil me-1"></i>
                      Изменить
                    </Link>
                  )}
                  {booking.status === 'confirmed' && (
                    <button 
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Отменить
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsList; 