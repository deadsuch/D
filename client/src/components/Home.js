import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../api';

const Home = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const events = await eventsAPI.getAll();
        // Получаем только ближайшие 3 мероприятия, у которых дата больше текущей
        const now = new Date();
        const upcoming = events
          .filter(event => new Date(event.date_time) > now)
          .sort((a, b) => new Date(a.date_time) - new Date(b.date_time))
          .slice(0, 3);
        
        setUpcomingEvents(upcoming);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUpcomingEvents();
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

  return (
    <div className="home-container fade-in">
      {/* Обновленная секция героя */}
      <div className="hero-section text-center text-md-start">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-7">
              <h1>Найдите и забронируйте лучшие события</h1>
              <p className="lead">
                Открывайте для себя захватывающие мероприятия, концерты, фестивали и многое другое. 
                Бронируйте билеты онлайн всего в несколько кликов!
              </p>
              <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start">
                <Link to="/events" className="btn btn-light btn-lg">
                  Смотреть мероприятия
                </Link>
                <Link to="/register" className="btn btn-outline-light btn-lg">
                  Зарегистрироваться
                </Link>
              </div>
            </div>
            <div className="col-md-5 d-none d-md-block">
              <img 
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Концертное мероприятие" 
                className="img-fluid rounded-3 shadow"
                style={{ maxHeight: '350px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ближайшие мероприятия */}
      <div className="container">
        <h2 className="section-title">Ближайшие мероприятия</h2>
        
        {loading && (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Загрузка...</span>
            </div>
          </div>
        )}
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        {!loading && !error && upcomingEvents.length === 0 && (
          <div className="alert alert-info">
            <div className="d-flex align-items-center">
              <i className="bi bi-info-circle me-2 fs-4"></i>
              <div>На данный момент нет запланированных мероприятий.</div>
            </div>
          </div>
        )}
        
        {!loading && !error && upcomingEvents.length > 0 && (
          <div className="row">
            {upcomingEvents.map(event => (
              <div className="col-md-4 mb-4" key={event.id}>
                <div className="card h-100 border-0 shadow-sm">
                  {event.image_url ? (
                    <img src={event.image_url} className="card-img-top event-image" alt={event.title} />
                  ) : (
                    <img 
                      src={`https://source.unsplash.com/random/600x400/?event,${event.id}`} 
                      className="card-img-top event-image" 
                      alt={event.title} 
                    />
                  )}
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex align-items-center mb-2">
                      <span className="badge bg-primary me-2">Скоро</span>
                      <small className="text-muted">{formatDate(event.date_time)}</small>
                    </div>
                    <h5 className="card-title">{event.title}</h5>
                    <p className="card-text text-muted mb-3">{event.description?.substring(0, 100)}...</p>
                    
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-geo-alt me-1"></i>
                          <span className="small">{event.location}</span>
                        </div>
                        <div className="fw-bold text-primary">{event.price} ₽</div>
                      </div>
                      
                      <Link to={`/events/${event.id}`} className="btn btn-primary w-100">
                        Забронировать
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center mt-4 mb-5">
          <Link to="/events" className="btn btn-outline-primary">
            Показать все мероприятия
          </Link>
        </div>
      </div>
      
      {/* Блок преимуществ */}
      <div className="container my-5">
        <h2 className="section-title">Почему выбирают нас</h2>
        
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card border-0 h-100">
              <div className="card-body text-center">
                <i className="bi bi-calendar-check feature-icon"></i>
                <h3 className="fs-4 mb-3">Удобный выбор</h3>
                <p className="card-text text-muted">
                  Выбирайте из сотен интересных мероприятий, фильтруйте по категориям, датам и местам проведения.
                </p>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card border-0 h-100">
              <div className="card-body text-center">
                <i className="bi bi-lightning-charge feature-icon"></i>
                <h3 className="fs-4 mb-3">Мгновенное бронирование</h3>
                <p className="card-text text-muted">
                  Бронируйте билеты в несколько кликов - мгновенное подтверждение без долгого ожидания.
                </p>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card border-0 h-100">
              <div className="card-body text-center">
                <i className="bi bi-shield-check feature-icon"></i>
                <h3 className="fs-4 mb-3">Безопасность</h3>
                <p className="card-text text-muted">
                  Ваши данные защищены, а оплата безопасна. Гарантия возврата при отмене мероприятия.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Отзывы клиентов */}
      <div className="container mb-5">
        <h2 className="section-title">Отзывы клиентов</h2>
        
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card border-0 h-100">
              <div className="card-body">
                <div className="mb-3 text-warning">
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                </div>
                <p className="card-text">
                  "Отличный сервис! Очень удобно бронировать билеты онлайн. Пользуюсь уже несколько месяцев и всегда всё отлично."
                </p>
                <div className="d-flex align-items-center mt-3">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>АП</div>
                  <div className="ms-3">
                    <h6 className="mb-0">Алексей Петров</h6>
                    <small className="text-muted">Постоянный клиент</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card border-0 h-100">
              <div className="card-body">
                <div className="mb-3 text-warning">
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-half"></i>
                </div>
                <p className="card-text">
                  "Большой выбор мероприятий и очень удобный интерфейс. Рекомендую всем, кто любит посещать интересные события!"
                </p>
                <div className="d-flex align-items-center mt-3">
                  <div className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>МС</div>
                  <div className="ms-3">
                    <h6 className="mb-0">Мария Соколова</h6>
                    <small className="text-muted">Новый пользователь</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card border-0 h-100">
              <div className="card-body">
                <div className="mb-3 text-warning">
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                </div>
                <p className="card-text">
                  "Самый удобный сервис для бронирования. Быстро, без лишних проблем. Техподдержка всегда на связи и помогает."
                </p>
                <div className="d-flex align-items-center mt-3">
                  <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>ИК</div>
                  <div className="ms-3">
                    <h6 className="mb-0">Иван Козлов</h6>
                    <small className="text-muted">Постоянный клиент</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 