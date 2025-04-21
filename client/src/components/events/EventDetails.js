import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI, bookingsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingCount, setBookingCount] = useState(1);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [userHasBooking, setUserHasBooking] = useState(false);
  const [processingBooking, setProcessingBooking] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await eventsAPI.getById(id);
        setEvent(data);
        
        // Проверка, есть ли у пользователя бронь на это мероприятие
        if (isAuthenticated) {
          const userBookings = await bookingsAPI.getUserBookings();
          const hasBooking = userBookings.some(booking => booking.event_id === parseInt(id));
          setUserHasBooking(hasBooking);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [id, isAuthenticated]);

  const handleBookingCountChange = (e) => {
    const count = parseInt(e.target.value);
    if (count >= 1 && count <= event.available_seats) {
      setBookingCount(count);
      setBookingError('');
    } else {
      setBookingError(`Количество билетов должно быть от 1 до ${event.available_seats}`);
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    if (bookingCount < 1 || bookingCount > event.available_seats) {
      setBookingError(`Количество билетов должно быть от 1 до ${event.available_seats}`);
      return;
    }

    try {
      setProcessingBooking(true);
      await bookingsAPI.create({
        event_id: parseInt(id),
        seats: bookingCount
      });
      
      // Обновление информации о мероприятии после бронирования
      const updatedEvent = await eventsAPI.getById(id);
      setEvent(updatedEvent);
      setUserHasBooking(true);
      setBookingSuccess('Бронирование успешно выполнено!');
      setBookingCount(1);
      
      // Очистка сообщения об успехе через 5 секунд
      setTimeout(() => {
        setBookingSuccess('');
      }, 5000);
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setProcessingBooking(false);
    }
  };

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
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <i className="bi bi-question-circle me-2"></i>
          Мероприятие не найдено
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date_time);
  const isPastEvent = eventDate < new Date();
  const isSoldOut = event.available_seats === 0;
  const isAlmostSoldOut = event.available_seats <= event.total_seats * 0.1;

  return (
    <div className="event-details-container fade-in py-4">
      <div className="container">
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="row g-0">
            <div className="col-md-5">
              <div className="event-image-container h-100">
                {event.image_url ? (
                  <img 
                    src={event.image_url} 
                    className="img-fluid h-100 w-100 object-cover" 
                    alt={event.title}
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <img 
                    src={`https://source.unsplash.com/random/800x1200/?event,${id}`} 
                    className="img-fluid h-100 w-100 object-cover" 
                    alt={event.title}
                    style={{ objectFit: 'cover' }}
                  />
                )}
              </div>
            </div>
            
            <div className="col-md-7">
              <div className="card-body p-4 p-lg-5 d-flex flex-column h-100">
                <div className="mb-4">
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {isPastEvent ? (
                      <span className="badge bg-secondary">Завершено</span>
                    ) : isSoldOut ? (
                      <span className="badge bg-danger">Билеты проданы</span>
                    ) : isAlmostSoldOut ? (
                      <span className="badge bg-warning text-dark">Осталось мало мест</span>
                    ) : (
                      <span className="badge bg-primary">Билеты в продаже</span>
                    )}
                    
                    <span className="badge bg-light text-primary border border-primary">
                      {event.price} ₽
                    </span>
                  </div>
                  
                  <h1 className="card-title mb-3">{event.title}</h1>
                  
                  <div className="event-meta mb-4">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="d-flex align-items-center text-muted">
                          <i className="bi bi-calendar-event me-2 text-primary"></i>
                          <span>{formatDate(event.date_time)}</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex align-items-center text-muted">
                          <i className="bi bi-geo-alt me-2 text-primary"></i>
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="event-description mb-4">
                  <h5 className="fw-bold mb-3">Описание</h5>
                  <p className="card-text">{event.description}</p>
                </div>
                
                {!isPastEvent && !isSoldOut && (
                  <div className="booking-section mt-auto pt-4 border-top">
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span>Доступно мест:</span>
                        <span className="fw-bold">{event.available_seats} из {event.total_seats}</span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className={`progress-bar ${isAlmostSoldOut ? 'bg-warning' : 'bg-success'}`}
                          role="progressbar" 
                          style={{ width: `${((event.total_seats - event.available_seats) / event.total_seats) * 100}%` }}
                          aria-valuenow={event.total_seats - event.available_seats} 
                          aria-valuemin="0" 
                          aria-valuemax={event.total_seats}
                        ></div>
                      </div>
                    </div>
                    
                    {userHasBooking ? (
                      <div className="alert alert-success">
                        <i className="bi bi-check-circle me-2"></i>
                        У вас уже есть бронь на это мероприятие
                      </div>
                    ) : (
                      <div className="booking-form">
                        <div className="row g-3 align-items-end">
                          <div className="col-md-6">
                            <label htmlFor="bookingCount" className="form-label">Количество билетов</label>
                            <input
                              type="number"
                              className="form-control"
                              id="bookingCount"
                              min="1"
                              max={event.available_seats}
                              value={bookingCount}
                              onChange={handleBookingCountChange}
                              disabled={processingBooking}
                            />
                          </div>
                          <div className="col-md-6">
                            <button 
                              className="btn btn-primary w-100"
                              onClick={handleBooking}
                              disabled={processingBooking || bookingCount < 1 || bookingCount > event.available_seats}
                            >
                              {processingBooking ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Обработка...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-cart-plus me-2"></i>
                                  Забронировать
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          {bookingError && (
                            <div className="alert alert-danger py-2">
                              <i className="bi bi-exclamation-triangle me-2"></i>
                              {bookingError}
                            </div>
                          )}
                          {bookingSuccess && (
                            <div className="alert alert-success py-2">
                              <i className="bi bi-check-circle me-2"></i>
                              {bookingSuccess}
                            </div>
                          )}
                          <div className="text-muted small mt-2">
                            <i className="bi bi-info-circle me-1"></i>
                            Итоговая цена: <strong>{event.price * bookingCount} ₽</strong>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {isPastEvent && (
                  <div className="alert alert-warning mt-auto">
                    <i className="bi bi-clock-history me-2"></i>
                    Это мероприятие уже завершилось
                  </div>
                )}
                
                {isSoldOut && !isPastEvent && !userHasBooking && (
                  <div className="alert alert-danger mt-auto">
                    <i className="bi bi-ticket-detailed me-2"></i>
                    К сожалению, все билеты на это мероприятие проданы
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="d-flex justify-content-start mt-4">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Назад
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails; 