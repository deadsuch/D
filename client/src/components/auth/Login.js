import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Получаем адрес, с которого был редирект (если есть)
  const [from, setFrom] = useState(location.state?.from || '/');
  
  // Получаем redirect из query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');
    if (redirect) {
      setFrom(redirect);
    }
  }, [location]);

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
    
    if (!formData.email.trim()) {
      errors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Некорректный формат email';
    }
    
    if (!formData.password) {
      errors.password = 'Пароль обязателен';
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
      await login(formData.email, formData.password);
      navigate(from);
    } catch (err) {
      setError(err.message || 'Ошибка при входе в систему');
    } finally {
      setLoading(false);
    }
  };

  // Демо-аккаунты для быстрого входа
  const demoAccounts = [
    { type: 'admin', email: 'admin@example.com', password: 'admin123' },
    { type: 'user', email: '1@gmail.com', password: '111111' }
  ];

  const handleDemoLogin = async (account) => {
    setLoading(true);
    setError('');
    
    try {
      await login(account.email, account.password);
      navigate(from);
    } catch (err) {
      setError(`Ошибка при входе в демо-аккаунт: ${err.message}`);
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
                <h2 className="fw-bold mb-1">Вход в систему</h2>
                <p className="text-muted">Войдите в свою учетную запись</p>
              </div>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
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
                
                <div className="mb-4">
                  <div className="d-flex justify-content-between">
                    <label htmlFor="password" className="form-label">Пароль</label>
                    <Link to="/forgot-password" className="text-decoration-none small">
                      Забыли пароль?
                    </Link>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-key"></i>
                    </span>
                    <input
                      type="password"
                      className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                      id="password"
                      name="password"
                      placeholder="Введите пароль"
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
                
                <div className="d-grid mb-4">
                  <button 
                    type="submit" 
                    className="btn btn-primary py-2" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Вход...
                      </>
                    ) : 'Войти'}
                  </button>
                </div>
                
                <div className="text-center">
                  <p>
                    Нет учетной записи? <Link to="/register" className="text-decoration-none">Зарегистрироваться</Link>
                  </p>
                </div>
              </form>
              
              <div className="my-4">
                <div className="text-center text-muted small mb-3">
                  <span>Быстрый вход в систему</span>
                </div>
                <div className="d-flex justify-content-center gap-2">
                  <button 
                    className="btn btn-outline-warning" 
                    onClick={() => handleDemoLogin(demoAccounts[0])}
                    disabled={loading}
                  >
                    <i className="bi bi-person-badge me-2"></i>
                    Администратор
                  </button>
                  <button 
                    className="btn btn-outline-info" 
                    onClick={() => handleDemoLogin(demoAccounts[1])}
                    disabled={loading}
                  >
                    <i className="bi bi-person me-2"></i>
                    Пользователь
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 