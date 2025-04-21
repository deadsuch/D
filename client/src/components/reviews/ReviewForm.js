import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { reviewsAPI, eventsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import StarRating from './StarRating';

const ReviewForm = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [reviewId, setReviewId] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: 5
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  // Определяем, находимся ли мы в режиме редактирования
  useEffect(() => {
    const checkEditMode = () => {
      // Проверяем, содержит ли URL "edit"
      const pathParts = window.location.pathname.split('/');
      if (pathParts.includes('edit')) {
        setIsEdit(true);
        setReviewId(pathParts[pathParts.length - 2]); // ID отзыва находится перед "edit"
      }
    };
    
    checkEditMode();
  }, []);
  
  // Загружаем данные о мероприятии и отзыве (если редактирование)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Если это редактирование, получаем данные отзыва
        if (isEdit && reviewId) {
          const review = await reviewsAPI.getById(reviewId);
          setFormData({
            title: review.title,
            content: review.content,
            rating: review.rating
          });
          
          // Также получаем данные о мероприятии
          const eventData = await eventsAPI.getById(review.event_id);
          setEvent(eventData);
        } 
        // Если это создание нового отзыва, просто получаем данные о мероприятии
        else if (eventId) {
          const eventData = await eventsAPI.getById(eventId);
          setEvent(eventData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isEdit, reviewId, eventId]);
  
  // Изменение формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очищаем ошибку для этого поля
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Изменение рейтинга
  const handleRatingChange = (newRating) => {
    setFormData(prev => ({
      ...prev,
      rating: newRating
    }));
    
    // Очищаем ошибку для рейтинга
    if (formErrors.rating) {
      setFormErrors(prev => ({
        ...prev,
        rating: ''
      }));
    }
  };
  
  // Валидация формы
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Заголовок отзыва обязателен';
    } else if (formData.title.length > 100) {
      errors.title = 'Заголовок не должен превышать 100 символов';
    }
    
    if (!formData.content.trim()) {
      errors.content = 'Текст отзыва обязателен';
    }
    
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      errors.rating = 'Оценка должна быть от 1 до 5';
    }
    
    return errors;
  };
  
  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      if (isEdit) {
        // Обновляем существующий отзыв
        await reviewsAPI.update(reviewId, formData);
        navigate(`/reviews/${reviewId}`);
      } else {
        // Создаем новый отзыв
        await reviewsAPI.create({
          ...formData,
          event_id: eventId
        });
        navigate(`/events/${eventId}/reviews`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
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
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>{isEdit ? 'Редактирование отзыва' : 'Новый отзыв'}</h2>
                <Link 
                  to={isEdit ? `/reviews/${reviewId}` : `/events/${eventId}/reviews`} 
                  className="btn btn-outline-secondary"
                >
                  <i className="bi bi-x-lg me-2"></i>
                  Отмена
                </Link>
              </div>
              
              <div className="mb-4">
                <h5 className="text-muted">{event.title}</h5>
              </div>
              
              {error && (
                <div className="alert alert-danger mb-4">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="rating" className="form-label">Ваша оценка</label>
                  <div className="mb-2">
                    <StarRating 
                      rating={formData.rating} 
                      size="lg" 
                      interactive={true}
                      onRatingChange={handleRatingChange}
                    />
                  </div>
                  {formErrors.rating && (
                    <div className="text-danger small">{formErrors.rating}</div>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="title" className="form-label">Заголовок отзыва</label>
                  <input
                    type="text"
                    className={`form-control ${formErrors.title ? 'is-invalid' : ''}`}
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Кратко опишите ваше впечатление"
                  />
                  {formErrors.title && (
                    <div className="invalid-feedback">{formErrors.title}</div>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="content" className="form-label">Текст отзыва</label>
                  <textarea
                    className={`form-control ${formErrors.content ? 'is-invalid' : ''}`}
                    id="content"
                    name="content"
                    rows="5"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Поделитесь своими впечатлениями о мероприятии"
                  ></textarea>
                  {formErrors.content && (
                    <div className="invalid-feedback">{formErrors.content}</div>
                  )}
                </div>
                
                <div className="d-grid">
                  <button 
                    type="submit" 
                    className="btn btn-primary py-2" 
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Отправка...
                      </>
                    ) : (
                      isEdit ? 'Сохранить изменения' : 'Опубликовать отзыв'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm; 