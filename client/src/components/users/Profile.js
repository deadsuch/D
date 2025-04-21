import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bookingsAPI } from '../../api';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: user?.email || '',
    username: user?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [cancelingBookingId, setCancelingBookingId] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await bookingsAPI.getUserBookings();
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateError('');
    setUpdateSuccess('');

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setUpdateError('Новые пароли не совпадают');
      return;
    }

    try {
      const updatedData = {
        email: formData.email,
        username: formData.username
      };

      if (formData.currentPassword && formData.newPassword) {
        updatedData.currentPassword = formData.currentPassword;
        updatedData.newPassword = formData.newPassword;
      }

      await updateUser(updatedData);
      setUpdateSuccess('Профиль успешно обновлен');
      
      // Очистка полей пароля после успешного обновления
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Очистка сообщения об успехе через 5 секунд
      setTimeout(() => {
        setUpdateSuccess('');
      }, 5000);
    } catch (err) {
      setUpdateError(err.message);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Вы уверены, что хотите отменить эту бронь?')) {
      try {
        setCancelingBookingId(bookingId);
        await bookingsAPI.delete(bookingId);
        setBookings(bookings.filter(booking => booking.id !== bookingId));
      } catch (err) {
        setError(err.message);
      } finally {
        setCancelingBookingId(null);
      }
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

  // Проверка, является ли мероприятие предстоящим
  const isUpcoming = (dateString) => {
    const eventDate = new Date(dateString);
    return eventDate > new Date();
  };

  return (
    <div className="profile-container fade-in py-4">
      <div className="container">
        <h2 className="section-title mb-4">Личный кабинет</h2>
        
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white p-0">
            <ul className="nav nav-tabs card-header-tabs">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <i className="bi bi-person me-2"></i>
                  Профиль
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('bookings')}
                >
                  <i className="bi bi-ticket-perforated me-2"></i>
                  Мои бронирования
                  {bookings.length > 0 && (
                    <span className="badge bg-primary ms-2">{bookings.length}</span>
                  )}
                </button>
              </li>
            </ul>
          </div>
          
          <div className="card-body p-4">
            {activeTab === 'profile' && (
              <div className="profile-form">
                <div className="row mb-4">
                  <div className="col-md-2 text-center">
                    <div className="profile-avatar mb-3">
                      <div className="avatar-circle bg-primary text-white">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-10">
                    <h4 className="mb-1">{user?.username}</h4>
                    <p className="text-muted mb-3">{user?.email}</p>
                    <div className="mb-3">
                      <span className="badge bg-light text-dark me-2">
                        <i className="bi bi-clock me-1"></i>
                        Аккаунт создан: {user?.created_at ? formatDate(user.created_at) : 'Н/Д'}
                      </span>
                      {user?.is_admin && (
                        <span className="badge bg-dark">
                          <i className="bi bi-shield-check me-1"></i>
                          Администратор
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <h5 className="mb-3">Основная информация</h5>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">Имя пользователя</label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <h5 className="mb-3">Изменить пароль</h5>
                  <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label">Текущий пароль</label>
                    <input
                      type="password"
                      className="form-control"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">Новый пароль</label>
                    <input
                      type="password"
                      className="form-control"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label">Подтверждение нового пароля</label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                  
                  {updateError && (
                    <div className="alert alert-danger">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {updateError}
                    </div>
                  )}
                  
                  {updateSuccess && (
                    <div className="alert alert-success">
                      <i className="bi bi-check-circle me-2"></i>
                      {updateSuccess}
                    </div>
                  )}
                  
                  <div className="text-end">
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-save me-2"></i>
                      Сохранить изменения
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {activeTab === 'bookings' && (
              <div className="bookings-list">
                {loading ? (
                  <div className="d-flex justify-content-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Загрузка...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="mb-3">
                      <i className="bi bi-ticket-perforated display-1 text-muted"></i>
                    </div>
                    <h5 className="text-muted mb-3">У вас пока нет бронирований</h5>
                    <Link to="/events" className="btn btn-primary">
                      <i className="bi bi-calendar-event me-2"></i>
                      Перейти к мероприятиям
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="mb-0">Ваши бронирования</h5>
                      <Link to="/events" className="btn btn-outline-primary btn-sm">
                        <i className="bi bi-plus-lg me-1"></i>
                        Забронировать еще
                      </Link>
                    </div>
                    
                    <div className="row g-3">
                      {bookings.map(booking => (
                        <div className="col-md-6" key={booking.id}>
                          <div className={`card h-100 border-0 shadow-sm ${!isUpcoming(booking.event.date_time) ? 'border-secondary' : ''}`}>
                            <div className="row g-0">
                              <div className="col-4">
                                <div className="h-100 position-relative">
                                  {booking.event.image_url ? (
                                    <img 
                                      src={booking.event.image_url} 
                                      alt={booking.event.title}
                                      className="img-fluid h-100 w-100 object-cover"
                                      style={{ objectFit: 'cover' }}
                                    />
                                  ) : (
                                    <img 
                                      src={`https://source.unsplash.com/random/300x400/?event,${booking.event.id}`} 
                                      alt={booking.event.title}
                                      className="img-fluid h-100 w-100 object-cover"
                                      style={{ objectFit: 'cover' }}
                                    />
                                  )}
                                  
                                  <div className="position-absolute top-0 start-0 p-2">
                                    {isUpcoming(booking.event.date_time) ? (
                                      <span className="badge bg-primary">Предстоящее</span>
                                    ) : (
                                      <span className="badge bg-secondary">Завершено</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="col-8">
                                <div className="card-body h-100 d-flex flex-column">
                                  <div>
                                    <small className="text-muted d-block mb-1">
                                      <i className="bi bi-calendar-event me-1"></i>
                                      {formatDate(booking.event.date_time)}
                                    </small>
                                    
                                    <h6 className="card-title mb-1">{booking.event.title}</h6>
                                    
                                    <small className="text-muted d-block mb-2">
                                      <i className="bi bi-geo-alt me-1"></i>
                                      {booking.event.location}
                                    </small>
                                    
                                    <div className="d-flex align-items-center mb-2">
                                      <span className="badge bg-light text-primary border border-primary me-2">
                                        {booking.event.price} ₽
                                      </span>
                                      <span className="small text-muted">
                                        <i className="bi bi-ticket me-1"></i>
                                        Билеты: {booking.seats}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-auto">
                                    <div className="d-flex gap-2">
                                      <Link 
                                        to={`/events/${booking.event.id}`} 
                                        className="btn btn-sm btn-outline-secondary"
                                      >
                                        Подробнее
                                      </Link>
                                      
                                      {isUpcoming(booking.event.date_time) && (
                                        <button 
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() => handleCancelBooking(booking.id)}
                                          disabled={cancelingBookingId === booking.id}
                                        >
                                          {cancelingBookingId === booking.id ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                          ) : (
                                            <span>Отменить</span>
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 