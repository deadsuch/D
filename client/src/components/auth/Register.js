import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
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
    
    if (!formData.username.trim()) {
      errors.username = 'Имя пользователя обязательно';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Некорректный формат email';
    }
    
    if (!formData.password) {
      errors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      errors.password = 'Пароль должен содержать минимум 6 символов';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }

    if (!termsAccepted) {
      errors.terms = 'Необходимо принять условия использования';
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
      await register(formData.username, formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4 p-lg-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-1">Регистрация</h2>
                <p className="text-muted">Создайте новую учетную запись</p>
              </div>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Имя пользователя</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      type="text"
                      className={`form-control ${formErrors.username ? 'is-invalid' : ''}`}
                      id="username"
                      name="username"
                      placeholder="Ваше имя"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                    {formErrors.username && (
                      <div className="invalid-feedback">
                        {formErrors.username}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      placeholder="example@mail.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    {formErrors.email && (
                      <div className="invalid-feedback">
                        {formErrors.email}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Пароль</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-key"></i>
                    </span>
                    <input
                      type="password"
                      className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                      id="password"
                      name="password"
                      placeholder="Минимум 6 символов"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    {formErrors.password && (
                      <div className="invalid-feedback">
                        {formErrors.password}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Подтверждение пароля</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-shield-lock"></i>
                    </span>
                    <input
                      type="password"
                      className={`form-control ${formErrors.confirmPassword ? 'is-invalid' : ''}`}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Повторите пароль"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    {formErrors.confirmPassword && (
                      <div className="invalid-feedback">
                        {formErrors.confirmPassword}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="form-check">
                    <input 
                      type="checkbox" 
                      className={`form-check-input ${formErrors.terms ? 'is-invalid' : ''}`}
                      id="termsCheck"
                      checked={termsAccepted}
                      onChange={() => setTermsAccepted(!termsAccepted)}
                      required
                    />
                    <label className="form-check-label" htmlFor="termsCheck">
                      Я согласен с <Link to="/terms" className="text-decoration-none">условиями использования</Link> и <Link to="/privacy" className="text-decoration-none">политикой конфиденциальности</Link>
                    </label>
                    {formErrors.terms && (
                      <div className="invalid-feedback">
                        {formErrors.terms}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="d-grid mb-4">
                  <button 
                    type="submit" 
                    className="btn btn-primary py-2" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Регистрация...
                      </>
                    ) : 'Зарегистрироваться'}
                  </button>
                </div>
                
                <div className="text-center">
                  <p>
                    Уже есть аккаунт? <Link to="/login" className="text-decoration-none">Войти</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 