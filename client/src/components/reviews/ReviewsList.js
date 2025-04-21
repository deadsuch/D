import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { reviewsAPI, eventsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import StarRating from './StarRating';

const ReviewsList = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, highest, lowest

  // Получаем данные о мероприятии и его отзывы
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Получаем информацию о мероприятии
        const eventData = await eventsAPI.getById(eventId);
        setEvent(eventData);
        
        // Получаем отзывы о мероприятии
        const reviewsData = await reviewsAPI.getByEventId(eventId);
        setReviews(reviewsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [eventId]);

  // Функция сортировки отзывов
  const sortedReviews = () => {
    return [...reviews].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  // Обработчик удаления отзыва
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      return;
    }
    
    try {
      await reviewsAPI.delete(reviewId);
      setReviews(reviews.filter(review => review.id !== reviewId));
    } catch (err) {
      setError(err.message);
    }
  };

  // Расчет средней оценки и количества отзывов по каждой звезде
  const calculateStats = () => {
    const total = reviews.length;
    if (total === 0) return { average: 0, counts: [0, 0, 0, 0, 0] };
    
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / total;
    
    const counts = [0, 0, 0, 0, 0]; // для оценок 1-5
    reviews.forEach(review => {
      counts[review.rating - 1]++;
    });
    
    return { average, counts };
  };

  const stats = calculateStats();

  // Проверка, оставил ли пользователь отзыв на это мероприятие
  const userHasReview = currentUser && reviews.some(review => review.user_id === currentUser.id);

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
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Отзывы о мероприятии</h2>
          <h5 className="text-muted">{event.title}</h5>
        </div>
        <Link to={`/events/${eventId}`} className="btn btn-outline-primary">
          <i className="bi bi-arrow-left me-2"></i>
          Назад к мероприятию
        </Link>
      </div>

      {/* Общая статистика отзывов */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-4 text-center">
              <div className="display-4 fw-bold">{stats.average.toFixed(1)}</div>
              <div className="mb-2">
                <StarRating rating={stats.average} size="lg" />
              </div>
              <div className="text-muted">На основе {reviews.length} отзывов</div>
            </div>
            <div className="col-md-8">
              {[5, 4, 3, 2, 1].map(star => (
                <div className="d-flex align-items-center mb-2" key={star}>
                  <div className="text-nowrap me-3">{star} <i className="bi bi-star-fill text-warning"></i></div>
                  <div className="progress flex-grow-1" style={{ height: '10px' }}>
                    <div 
                      className="progress-bar bg-warning" 
                      role="progressbar" 
                      style={{ width: `${reviews.length ? (stats.counts[star - 1] / reviews.length) * 100 : 0}%` }}
                      aria-valuenow={stats.counts[star - 1]} 
                      aria-valuemin="0" 
                      aria-valuemax={reviews.length}
                    ></div>
                  </div>
                  <div className="ms-3 text-muted">{stats.counts[star - 1]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка добавления нового отзыва */}
      {currentUser && !userHasReview && (
        <div className="text-center mb-4">
          <Link to={`/events/${eventId}/reviews/new`} className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Написать отзыв
          </Link>
        </div>
      )}
      
      {/* Фильтр отзывов */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="text-muted small">
          {reviews.length} {reviews.length === 1 ? 'отзыв' : 
          reviews.length > 1 && reviews.length < 5 ? 'отзыва' : 'отзывов'}
        </div>
        <div className="d-flex align-items-center">
          <label htmlFor="sortReviews" className="form-label mb-0 me-2">Сортировать:</label>
          <select 
            id="sortReviews" 
            className="form-select form-select-sm" 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="newest">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
            <option value="highest">По убыванию оценки</option>
            <option value="lowest">По возрастанию оценки</option>
          </select>
        </div>
      </div>

      {/* Список отзывов */}
      {reviews.length === 0 ? (
        <div className="alert alert-info">
          <div className="text-center">
            <i className="bi bi-chat-square-text display-5 d-block mb-3"></i>
            <h5>Отзывов пока нет</h5>
            <p>Будьте первым, кто оставит отзыв об этом мероприятии!</p>
          </div>
        </div>
      ) : (
        <div className="row">
          {sortedReviews().map(review => (
            <div className="col-12 mb-4" key={review.id}>
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle bg-light text-primary d-flex align-items-center justify-content-center me-3" 
                           style={{ width: "40px", height: "40px", fontSize: "18px" }}>
                        {review.user_name?.substring(0, 1).toUpperCase() || "U"}
                      </div>
                      <div>
                        <h6 className="mb-0">{review.user_name}</h6>
                        <small className="text-muted">{formatDate(review.created_at)}</small>
                      </div>
                    </div>
                    <div>
                      <StarRating rating={review.rating} />
                    </div>
                  </div>
                  
                  <h5 className="mb-3">{review.title}</h5>
                  <p className="mb-3">{review.content}</p>
                  
                  {/* Действия с отзывом */}
                  {currentUser && (currentUser.id === review.user_id || currentUser.role === 'admin') && (
                    <div className="d-flex gap-2 mt-3">
                      <Link to={`/reviews/${review.id}/edit`} className="btn btn-sm btn-outline-primary">
                        <i className="bi bi-pencil me-1"></i>
                        Редактировать
                      </Link>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        <i className="bi bi-trash me-1"></i>
                        Удалить
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsList; 