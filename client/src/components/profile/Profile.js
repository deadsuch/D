import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { currentUser, updateProfile, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  
  // Состояние для редактирования профиля
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Состояние для смены пароля
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Обработка сохранения профиля
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);
    
    try {
      await updateProfile({ name, email });
      setProfileSuccess('Профиль успешно обновлен');
      setIsEditing(false);
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  // Обработка смены пароля
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    // Проверка совпадения паролей
    if (newPassword !== confirmPassword) {
      return setPasswordError('Пароли не совпадают');
    }
    
    setPasswordLoading(true);
    
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess('Пароль успешно изменен');
      setIsChangingPassword(false);
      
      // Очищаем поля
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Обработка выхода из системы
  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="profile-container">
      <h2>Профиль пользователя</h2>
      
      <div className="card mb-4">
        <div className="card-body">
          <h3 className="card-title">Личная информация</h3>
          
          {profileError && <div className="alert alert-danger">{profileError}</div>}
          {profileSuccess && <div className="alert alert-success">{profileSuccess}</div>}
          
          {isEditing ? (
            <form onSubmit={handleSaveProfile}>
              <div className="form-group mb-3">
                <label htmlFor="name">Имя</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
              
              <div className="form-group mb-3">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
              
              <div className="d-flex">
                <button
                  type="button"
                  className="btn btn-outline-secondary me-2"
                  onClick={() => {
                    setIsEditing(false);
                    setName(currentUser?.name || '');
                    setEmail(currentUser?.email || '');
                    setProfileError('');
                    setProfileSuccess('');
                  }}
                  disabled={profileLoading}
                >
                  Отмена
                </button>
                
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={profileLoading}
                >
                  {profileLoading ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="mb-3">
                <strong>Имя:</strong> {currentUser?.name}
              </div>
              
              <div className="mb-3">
                <strong>Email:</strong> {currentUser?.email}
              </div>
              
              <div className="mb-3">
                <strong>Роль:</strong> {currentUser?.role === 'admin' ? 'Администратор' : 'Клиент'}
              </div>
              
              <button
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                Редактировать
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-body">
          <h3 className="card-title">Изменение пароля</h3>
          
          {passwordError && <div className="alert alert-danger">{passwordError}</div>}
          {passwordSuccess && <div className="alert alert-success">{passwordSuccess}</div>}
          
          {isChangingPassword ? (
            <form onSubmit={handleChangePassword}>
              <div className="form-group mb-3">
                <label htmlFor="currentPassword">Текущий пароль</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
              
              <div className="form-group mb-3">
                <label htmlFor="newPassword">Новый пароль</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-control"
                  required
                  minLength="6"
                />
              </div>
              
              <div className="form-group mb-3">
                <label htmlFor="confirmPassword">Подтверждение пароля</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-control"
                  required
                  minLength="6"
                />
              </div>
              
              <div className="d-flex">
                <button
                  type="button"
                  className="btn btn-outline-secondary me-2"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                    setPasswordSuccess('');
                  }}
                  disabled={passwordLoading}
                >
                  Отмена
                </button>
                
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Изменение...' : 'Изменить пароль'}
                </button>
              </div>
            </form>
          ) : (
            <button
              className="btn btn-warning"
              onClick={() => setIsChangingPassword(true)}
            >
              Изменить пароль
            </button>
          )}
        </div>
      </div>
      
      <div className="d-flex justify-content-between">
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate('/bookings')}
        >
          Мои бронирования
        </button>
        
        <button
          className="btn btn-danger"
          onClick={handleLogout}
        >
          Выйти из системы
        </button>
      </div>
    </div>
  );
};

export default Profile; 