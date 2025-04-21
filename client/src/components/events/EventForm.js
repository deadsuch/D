import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const EventForm = () => {
  const { id } = useParams(); // Если есть id, значит это редактирование
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date_time: '',
    location: '',
    total_seats: '',
    price: '',
    image_url: ''
  });
  
  const [loading, setLoading] = useState(id ? true : false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Загружаем данные мероприятия для редактирования
  useEffect(() => {
    if (id) {
      const fetchEvent = async () => {
        try {
          const event = await eventsAPI.getById(id);
          
          // Форматируем дату и время для поля ввода
          const date = new Date(event.date_time);
          const formattedDate = date.toISOString().substring(0, 16);
          
          setFormData({
            title: event.title,
            description: event.description || '',
            date_time: formattedDate,
            location: event.location,
            total_seats: event.total_seats,
            available_seats: event.available_seats,
            price: event.price,
            image_url: event.image_url || ''
          });
          
          setLoading(false);
        } catch (err) {
          setError(err.message);
          setLoading(false);
        }
      };
      
      fetchEvent();
    }
  }, [id]);

  // Проверяем права администратора
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  // Обработка изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    try {
      // Проверяем, что цена и количество мест - числа
      const numericPrice = parseFloat(formData.price);
      const numericTotalSeats = parseInt(formData.total_seats);
      
      if (isNaN(numericPrice) || numericPrice <= 0) {
        throw new Error('Цена должна быть положительным числом');
      }
      
      if (isNaN(numericTotalSeats) || numericTotalSeats <= 0) {
        throw new Error('Количество мест должно быть положительным числом');
      }
      
      const eventData = {
        ...formData,
        price: numericPrice,
        total_seats: numericTotalSeats
      };
      
      if (id) {
        // Редактирование существующего мероприятия
        await eventsAPI.update(id, eventData);
      } else {
        // Создание нового мероприятия
        await eventsAPI.create(eventData);
      }
      
      navigate('/events');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center">Загрузка...</div>;
  }

  return (
    <div className="event-form-container">
      <h2>{id ? 'Редактирование мероприятия' : 'Создание нового мероприятия'}</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label htmlFor="title">Название мероприятия*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        
        <div className="form-group mb-3">
          <label htmlFor="description">Описание</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-control"
            rows="4"
          />
        </div>
        
        <div className="form-group mb-3">
          <label htmlFor="date_time">Дата и время*</label>
          <input
            type="datetime-local"
            id="date_time"
            name="date_time"
            value={formData.date_time}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        
        <div className="form-group mb-3">
          <label htmlFor="location">Место проведения*</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        
        <div className="row">
          <div className="col-md-6">
            <div className="form-group mb-3">
              <label htmlFor="total_seats">Общее количество мест*</label>
              <input
                type="number"
                id="total_seats"
                name="total_seats"
                value={formData.total_seats}
                onChange={handleChange}
                className="form-control"
                min="1"
                required
              />
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="form-group mb-3">
              <label htmlFor="price">Цена билета (₽)*</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="form-control"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
        </div>
        
        <div className="form-group mb-3">
          <label htmlFor="image_url">URL изображения</label>
          <input
            type="url"
            id="image_url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            className="form-control"
            placeholder="https://example.com/image.jpg"
          />
        </div>
        
        <div className="d-flex justify-content-between mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate('/events')}
          >
            Отмена
          </button>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Сохранение...' : (id ? 'Сохранить изменения' : 'Создать мероприятие')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm; 