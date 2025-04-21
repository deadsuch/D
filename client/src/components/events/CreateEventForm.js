import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI } from '../../api';

const CreateEventForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date_time: '',
    location: '',
    total_seats: '',
    price: '',
    image_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Очистка ошибки для поля при его изменении
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Название мероприятия обязательно';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Описание мероприятия обязательно';
    }
    
    if (!formData.date_time) {
      errors.date_time = 'Дата и время мероприятия обязательны';
    } else {
      const eventDate = new Date(formData.date_time);
      const now = new Date();
      if (eventDate < now) {
        errors.date_time = 'Дата и время мероприятия должны быть в будущем';
      }
    }
    
    if (!formData.location.trim()) {
      errors.location = 'Место проведения обязательно';
    }
    
    if (!formData.total_seats) {
      errors.total_seats = 'Количество мест обязательно';
    } else if (parseInt(formData.total_seats) <= 0) {
      errors.total_seats = 'Количество мест должно быть больше нуля';
    }
    
    if (!formData.price) {
      errors.price = 'Цена обязательна';
    } else if (parseFloat(formData.price) < 0) {
      errors.price = 'Цена не может быть отрицательной';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация формы
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await eventsAPI.create({
        ...formData,
        total_seats: parseInt(formData.total_seats),
        price: parseFloat(formData.price),
      });
      navigate('/events');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-container fade-in py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 p-lg-5">
                <h2 className="section-title mb-4">Создать мероприятие</h2>
                
                {error && (
                  <div className="alert alert-danger mb-4">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="row g-4">
                    <div className="col-12">
                      <label htmlFor="title" className="form-label">Название мероприятия</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.title ? 'is-invalid' : ''}`}
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Введите название мероприятия"
                      />
                      {formErrors.title && (
                        <div className="invalid-feedback">{formErrors.title}</div>
                      )}
                    </div>
                    
                    <div className="col-12">
                      <label htmlFor="description" className="form-label">Описание</label>
                      <textarea
                        className={`form-control ${formErrors.description ? 'is-invalid' : ''}`}
                        id="description"
                        name="description"
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Введите подробное описание мероприятия"
                      ></textarea>
                      {formErrors.description && (
                        <div className="invalid-feedback">{formErrors.description}</div>
                      )}
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="date_time" className="form-label">Дата и время</label>
                      <input
                        type="datetime-local"
                        className={`form-control ${formErrors.date_time ? 'is-invalid' : ''}`}
                        id="date_time"
                        name="date_time"
                        value={formData.date_time}
                        onChange={handleChange}
                      />
                      {formErrors.date_time && (
                        <div className="invalid-feedback">{formErrors.date_time}</div>
                      )}
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="location" className="form-label">Место проведения</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.location ? 'is-invalid' : ''}`}
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Адрес или название места"
                      />
                      {formErrors.location && (
                        <div className="invalid-feedback">{formErrors.location}</div>
                      )}
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="total_seats" className="form-label">Количество мест</label>
                      <input
                        type="number"
                        min="1"
                        className={`form-control ${formErrors.total_seats ? 'is-invalid' : ''}`}
                        id="total_seats"
                        name="total_seats"
                        value={formData.total_seats}
                        onChange={handleChange}
                        placeholder="Общее количество доступных мест"
                      />
                      {formErrors.total_seats && (
                        <div className="invalid-feedback">{formErrors.total_seats}</div>
                      )}
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="price" className="form-label">Цена (₽)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={`form-control ${formErrors.price ? 'is-invalid' : ''}`}
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="Цена билета"
                      />
                      {formErrors.price && (
                        <div className="invalid-feedback">{formErrors.price}</div>
                      )}
                    </div>
                    
                    <div className="col-12">
                      <label htmlFor="image_url" className="form-label">URL изображения (необязательно)</label>
                      <input
                        type="url"
                        className="form-control"
                        id="image_url"
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                      />
                      <div className="form-text">Если оставить поле пустым, будет использовано случайное изображение</div>
                    </div>
                    
                    <div className="col-12 d-flex justify-content-between mt-4">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => navigate('/events')}
                      >
                        <i className="bi bi-arrow-left me-2"></i>
                        Отмена
                      </button>
                      
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Создание...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            Создать мероприятие
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventForm; 