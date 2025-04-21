import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer mt-auto py-5 bg-light">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 mb-4 mb-lg-0">
            <h5 className="fw-bold mb-3">Booking Events</h5>
            <p className="text-muted mb-3">
              Современная платформа для бронирования билетов на различные мероприятия: 
              концерты, спектакли, мастер-классы и многое другое.
            </p>
            <div className="social-links d-flex gap-3">
              <a href="https://facebook.com" className="text-secondary" title="Facebook">
                <i className="bi bi-facebook fs-5"></i>
              </a>
              <a href="https://instagram.com" className="text-secondary" title="Instagram">
                <i className="bi bi-instagram fs-5"></i>
              </a>
              <a href="https://twitter.com" className="text-secondary" title="Twitter">
                <i className="bi bi-twitter fs-5"></i>
              </a>
              <a href="https://youtube.com" className="text-secondary" title="YouTube">
                <i className="bi bi-youtube fs-5"></i>
              </a>
            </div>
          </div>
          
          <div className="col-sm-6 col-lg-2 mb-4 mb-lg-0">
            <h6 className="fw-bold mb-3">Навигация</h6>
            <ul className="footer-links">
              <li>
                <Link to="/" className="text-secondary text-decoration-none">Главная</Link>
              </li>
              <li>
                <Link to="/events" className="text-secondary text-decoration-none">Мероприятия</Link>
              </li>
              <li>
                <Link to="/about" className="text-secondary text-decoration-none">О нас</Link>
              </li>
              <li>
                <Link to="/contact" className="text-secondary text-decoration-none">Контакты</Link>
              </li>
            </ul>
          </div>
          
          <div className="col-sm-6 col-lg-2 mb-4 mb-lg-0">
            <h6 className="fw-bold mb-3">Поддержка</h6>
            <ul className="footer-links">
              <li>
                <Link to="/faq" className="text-secondary text-decoration-none">Часто задаваемые вопросы</Link>
              </li>
              <li>
                <Link to="/terms" className="text-secondary text-decoration-none">Условия использования</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-secondary text-decoration-none">Политика конфиденциальности</Link>
              </li>
              <li>
                <a href="mailto:support@example.com" className="text-secondary text-decoration-none">
                  Служба поддержки
                </a>
              </li>
            </ul>
          </div>
          
          <div className="col-lg-4">
            <h6 className="fw-bold mb-3">Подпишитесь на рассылку</h6>
            <p className="text-muted mb-3">
              Будьте в курсе новых мероприятий и специальных предложений
            </p>
            <div className="input-group mb-3">
              <input 
                type="email" 
                className="form-control" 
                placeholder="Ваш email" 
                aria-label="Ваш email" 
              />
              <button 
                className="btn btn-primary" 
                type="button"
              >
                Подписаться
              </button>
            </div>
            <div className="d-flex align-items-center mt-4">
              <i className="bi bi-headset text-primary me-2 fs-4"></i>
              <div>
                <p className="text-muted mb-0 small">Нужна помощь? Звоните</p>
                <a href="tel:+71234567890" className="text-dark fw-bold text-decoration-none">
                  +7 (123) 456-78-90
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-top mt-5 pt-4">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              <p className="text-muted mb-0">
                &copy; {currentYear} Booking Events. Все права защищены.
              </p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <div className="d-flex justify-content-center justify-content-md-end">
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/196/196566.png" 
                  alt="Visa" 
                  className="payment-icon me-2"
                  width="32"
                  height="32"
                />
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/196/196561.png" 
                  alt="MasterCard" 
                  className="payment-icon me-2"
                  width="32"
                  height="32"
                />
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/5977/5977575.png" 
                  alt="Mir" 
                  className="payment-icon"
                  width="32"
                  height="32"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 