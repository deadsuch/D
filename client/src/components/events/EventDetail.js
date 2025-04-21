import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventsAPI, bookingsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [userHasBooking, setUserHasBooking] = useState(false);
  const [userBookingId, setUserBookingId] = useState(null);

  // Загрузка данных о мероприятии
  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        const eventData = await eventsAPI.getById(id);
        setEvent(eventData);
        
        // Проверяем, забронировал ли пользователь это мероприятие
        if (currentUser) {
          try {
            const userBookings = await bookingsAPI.getAll();
            const booking = userBookings.find(booking => booking.event_id === parseInt(id));
            
            if (booking) {
              setUserHasBooking(true);
              setUserBookingId(booking.id);
            } else {
              setUserHasBooking(false);
              setUserBookingId(null);
            }
          } catch (error) {
            console.error("Ошибка при получении бронирований:", error);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventDetail();
  }, [id, currentUser]);

  // Форматирование даты
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  // Обработка бронирования
  const handleBookEvent = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }
    
    setIsBookingLoading(true);
    setBookingError(null);
    
    try {
      // Бронируем 1 место
      const booking = await bookingsAPI.create({ 
        event_id: id,
        tickets_count: 1
      });
      
      setBookingSuccess(true);
      setUserHasBooking(true);
      setUserBookingId(booking.id);
      
      // Обновляем количество доступных мест
      const updatedEvent = await eventsAPI.getById(id);
      setEvent(updatedEvent);
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setIsBookingLoading(false);
    }
  };

  // Обработка отмены бронирования
  const handleCancelBooking = async () => {
    if (!userBookingId) {
      setBookingError("Бронирование не найдено");
      return;
    }
    
    setIsBookingLoading(true);
    setBookingError(null);
    
    try {
      // Отменяем бронирование по его ID
      await bookingsAPI.cancel(userBookingId);
      
      setUserHasBooking(false);
      setUserBookingId(null);
      setBookingSuccess(false);
      
      // Обновляем количество доступных мест
      const updatedEvent = await eventsAPI.getById(id);
      setEvent(updatedEvent);
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setIsBookingLoading(false);
    }
  };

  // Обработка удаления мероприятия (только для администраторов)
  const handleDeleteEvent = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить это мероприятие?')) {
      return;
    }
    
    try {
      await eventsAPI.delete(id);
      navigate('/events');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h4>Ошибка!</h4>
          <p>{error}</p>
          <Link to="/events" className="btn btn-primary">Вернуться к списку мероприятий</Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <h4>Мероприятие не найдено</h4>
          <p>Запрашиваемое мероприятие не существует или было удалено.</p>
          <Link to="/events" className="btn btn-primary">Вернуться к списку мероприятий</Link>
        </div>
      </div>
    );
  }

  const isEventFull = event.available_seats <= 0;
  const eventDate = new Date(event.date_time);
  const isPastEvent = eventDate < new Date();

  return (
    <div className="container py-5">
      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="row g-0">
          <div className="col-md-6">
            <img 
              src={event.image_url || 'https://via.placeholder.com/600x400?text=Нет+изображения'} 
              className="img-fluid rounded-start h-100 object-fit-cover" 
              alt={event.title}
              style={{ objectFit: 'cover', height: '100%' }}
            />
          </div>
          <div className="col-md-6">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h2 className="card-title mb-0">{event.title}</h2>
                {isPastEvent && (
                  <span className="badge bg-secondary">Завершено</span>
                )}
                {!isPastEvent && isEventFull && (
                  <span className="badge bg-danger">Мест нет</span>
                )}
                {!isPastEvent && !isEventFull && (
                  <span className="badge bg-success">Доступно</span>
                )}
              </div>
              
              <p className="text-muted mb-4">
                <i className="bi bi-geo-alt me-2"></i>
                {event.location}
              </p>
              
              <div className="mb-4">
                <h5>О мероприятии</h5>
                <p className="card-text">{event.description}</p>
              </div>
              
              <div className="row mb-4">
                <div className="col-sm-6">
                  <div className="mb-3">
                    <h6><i className="bi bi-calendar me-2"></i>Дата и время</h6>
                    <p className="text-muted">{formatDate(event.date_time)}</p>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="mb-3">
                    <h6><i className="bi bi-cash me-2"></i>Цена</h6>
                    <p className="text-muted">
                      {event.price > 0 ? `${event.price} ₽` : 'Бесплатно'}
                    </p>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div>
                    <h6><i className="bi bi-person me-2"></i>Всего мест</h6>
                    <p className="text-muted">{event.total_seats}</p>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div>
                    <h6><i className="bi bi-check-circle me-2"></i>Доступно</h6>
                    <p className={`text-${event.available_seats > 0 ? 'success' : 'danger'}`}>
                      {event.available_seats}
                    </p>
                  </div>
                </div>
              </div>
              
              {bookingSuccess && (
                <div className="alert alert-success mb-4">
                  <i className="bi bi-check-circle me-2"></i>
                  Вы успешно забронировали место на это мероприятие!
                </div>
              )}
              
              {bookingError && (
                <div className="alert alert-danger mb-4">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {bookingError}
                </div>
              )}
              
              <div className="d-flex flex-wrap gap-2">
                <Link to="/events" className="btn btn-outline-secondary">
                  <i className="bi bi-arrow-left me-2"></i>
                  Назад к списку
                </Link>
                
                {/* Кнопки для обычных пользователей */}
                {currentUser && !isAdmin && (
                  userHasBooking ? (
                    <button 
                      className="btn btn-danger" 
                      onClick={handleCancelBooking}
                      disabled={isPastEvent || isBookingLoading}
                    >
                      {isBookingLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Обработка...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-x-circle me-2"></i>
                          Отменить бронирование
                        </>
                      )}
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary" 
                      onClick={handleBookEvent}
                      disabled={isPastEvent || isEventFull || isBookingLoading}
                    >
                      {isBookingLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Обработка...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-ticket-perforated me-2"></i>
                          Забронировать
                        </>
                      )}
                    </button>
                  )
                )}
                
                {/* Кнопки для неавторизованных пользователей */}
                {!currentUser && (
                  <Link to={`/login?redirect=/events/${id}`} className="btn btn-primary">
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Войти для бронирования
                  </Link>
                )}
                
                {/* Кнопки для администраторов */}
                {isAdmin && (
                  <div className="btn-group">
                    <Link to={`/events/edit/${id}`} className="btn btn-warning">
                      <i className="bi bi-pencil me-2"></i>
                      Редактировать
                    </Link>
                    <button 
                      className="btn btn-danger" 
                      onClick={handleDeleteEvent}
                    >
                      <i className="bi bi-trash me-2"></i>
                      Удалить
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail; 