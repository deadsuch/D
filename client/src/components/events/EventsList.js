import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'price-asc', 'price-desc'
  const [filterCategory, setFilterCategory] = useState('all');
  
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventsAPI.getAll();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  // Получаем все категории из событий для фильтра
  const categories = ['all', ...new Set(events.map(event => 
    event.category || 'Прочее'
  ))];

  // Фильтрация событий по поисковому запросу и категории
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      filterCategory === 'all' || 
      (event.category || 'Прочее') === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Сортировка событий
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.date_time) - new Date(b.date_time);
    } else if (sortBy === 'price-asc') {
      return a.price - b.price;
    } else if (sortBy === 'price-desc') {
      return b.price - a.price;
    }
    return 0;
  });

  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  // Форматирование времени
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Функция для удаления мероприятия (только для админа)
  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить это мероприятие?')) {
      try {
        await eventsAPI.delete(id);
        setEvents(events.filter(event => event.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Получение иконки для категории
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Концерт': return 'bi-music-note-beamed';
      case 'Театр': return 'bi-ticket-perforated';
      case 'Выставка': return 'bi-easel';
      case 'Спорт': return 'bi-trophy';
      case 'Образование': return 'bi-book';
      case 'Конференция': return 'bi-people';
      default: return 'bi-calendar-event';
    }
  };

  return (
    <div className="container py-5">
      {/* Заголовок и кнопка добавления */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 fw-bold">Мероприятия</h2>
        
        {isAdmin && (
          <Link to="/events/create" className="btn btn-primary rounded-pill px-3">
            <i className="bi bi-plus-lg me-2"></i>
            Создать мероприятие
          </Link>
        )}
      </div>
      
      {/* Фильтры и поиск */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3 p-md-4">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text border-0 bg-light">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0 bg-light"
                  placeholder="Поиск мероприятий..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select border-0 bg-light"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">Все категории</option>
                {categories.filter(cat => cat !== 'all').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select border-0 bg-light"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">По дате (ближайшие)</option>
                <option value="price-asc">По цене (возрастание)</option>
                <option value="price-desc">По цене (убывание)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Состояние загрузки */}
      {loading && (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      )}

      {/* Ошибка загрузки */}
      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
        </div>
      )}

      {/* Результат поиска */}
      {!loading && !error && searchTerm && filteredEvents.length === 0 && (
        <div className="alert alert-info border-0 shadow-sm">
          <i className="bi bi-info-circle-fill me-2"></i>
          По запросу "{searchTerm}" ничего не найдено.
        </div>
      )}

      {/* Нет мероприятий */}
      {!loading && !error && events.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-calendar-x display-1 text-muted mb-3"></i>
          <h4>На данный момент мероприятий нет</h4>
          <p className="text-muted">Загляните позже, мы обязательно добавим интересные события</p>
        </div>
      )}

      {/* Список мероприятий */}
      {!loading && !error && sortedEvents.length > 0 && (
        <>
          {/* Счетчик результатов */}
          <div className="mb-3 text-muted small">
            Найдено: {sortedEvents.length} {sortedEvents.length === 1 ? 'мероприятие' : 
              sortedEvents.length >= 2 && sortedEvents.length <= 4 ? 'мероприятия' : 'мероприятий'}
          </div>
          
          <div className="row g-4">
            {sortedEvents.map(event => {
              const eventDate = new Date(event.date_time);
              const isUpcoming = eventDate > new Date();
              const isSoldOut = event.available_seats === 0;
              const isAlmostSoldOut = event.available_seats <= event.total_seats * 0.1;
              
              return (
                <div className="col-sm-6 col-lg-4" key={event.id}>
                  <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="position-relative">
                      <img 
                        src={event.image_url || `https://source.unsplash.com/random/600x400/?event,${event.id}`} 
                        className="card-img-top event-image" 
                        alt={event.title}
                        style={{ 
                          height: '180px', 
                          objectFit: 'cover',
                          filter: !isUpcoming ? 'grayscale(0.5)' : 'none'
                        }} 
                      />
                      
                      {/* Категория */}
                      <div className="position-absolute top-0 start-0 p-3">
                        <span className="badge bg-light text-dark rounded-pill px-3 py-2 shadow-sm">
                          <i className={`bi ${getCategoryIcon(event.category || 'Прочее')} me-1`}></i>
                          {event.category || 'Прочее'}
                        </span>
                      </div>
                      
                      {/* Бейджи состояния */}
                      <div className="position-absolute top-0 end-0 p-3">
                        {!isUpcoming ? (
                          <span className="badge bg-secondary rounded-pill px-3 py-2">Завершено</span>
                        ) : isSoldOut ? (
                          <span className="badge bg-danger rounded-pill px-3 py-2">Мест нет</span>
                        ) : isAlmostSoldOut ? (
                          <span className="badge bg-warning text-dark rounded-pill px-3 py-2">Осталось мало мест</span>
                        ) : null}
                      </div>
                    </div>
                    
                    <div className="card-body p-4 d-flex flex-column">
                      <div className="d-flex align-items-center mb-3">
                        <div className="rounded-circle bg-light p-2 me-3 text-primary">
                          <i className="bi bi-calendar-date"></i>
                        </div>
                        <div>
                          <div className="fw-bold">{formatDate(event.date_time)}</div>
                          <div className="small text-muted">{formatTime(event.date_time)}</div>
                        </div>
                      </div>
                      
                      <h5 className="card-title mb-3 fw-bold">{event.title}</h5>
                      
                      <div className="d-flex align-items-center mb-3">
                        <div className="rounded-circle bg-light p-2 me-3 text-primary">
                          <i className="bi bi-geo-alt"></i>
                        </div>
                        <div className="small text-truncate">{event.location}</div>
                      </div>
                      
                      {!isSoldOut && isUpcoming && (
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center small text-muted mb-1">
                            <span>Заполнение</span>
                            <span>{event.available_seats} из {event.total_seats}</span>
                          </div>
                          <div className="progress" style={{ height: '4px' }}>
                            <div 
                              className={`progress-bar ${
                                isAlmostSoldOut ? 'bg-warning' : 
                                event.available_seats < event.total_seats / 2 ? 'bg-success' : 'bg-info'
                              }`}
                              role="progressbar" 
                              style={{ 
                                width: `${((event.total_seats - event.available_seats) / event.total_seats) * 100}%` 
                              }}
                              aria-valuenow={event.total_seats - event.available_seats} 
                              aria-valuemin="0" 
                              aria-valuemax={event.total_seats}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      <div className="d-flex justify-content-between align-items-center mt-auto">
                        <span className="badge bg-white border border-primary text-primary fs-6 px-3 py-2">
                          {event.price > 0 ? `${event.price} ₽` : 'Бесплатно'}
                        </span>
                        
                        <Link 
                          to={`/events/${event.id}`} 
                          className={`btn ${
                            !isUpcoming ? 'btn-outline-secondary' : 
                            isSoldOut ? 'btn-secondary' : 'btn-primary'
                          } rounded-pill px-3`}
                        >
                          {!isUpcoming ? 'Подробнее' : 
                           isSoldOut ? 'Нет мест' : 'Забронировать'}
                        </Link>
                      </div>
                      
                      {isAdmin && (
                        <div className="mt-3 d-flex gap-2">
                          <Link 
                            to={`/events/edit/${event.id}`} 
                            className="btn btn-sm btn-outline-primary w-100"
                          >
                            <i className="bi bi-pencil me-1"></i>
                            Редактировать
                          </Link>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(event.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default EventsList; 