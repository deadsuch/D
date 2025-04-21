import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Закрываем выпадающие меню при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Импортируем bootstrap.js для поддержки выпадающего меню
  useEffect(() => {
    // Динамически импортируем bootstrap.js
    const loadBootstrap = async () => {
      try {
        await import('bootstrap/dist/js/bootstrap.bundle.min.js');
      } catch (error) {
        console.error("Не удалось загрузить bootstrap.js", error);
      }
    };

    loadBootstrap();
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-ticket-perforated-fill me-2"></i>
          <span>EventBooking</span>
        </Link>
        
        <button 
          className="navbar-toggler border-0" 
          type="button" 
          onClick={toggleMenu}
          aria-expanded={isMenuOpen ? 'true' : 'false'}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {/* Главная - показываем только не-админам */}
            {!isAdmin && (
              <li className="nav-item">
                <NavLink 
                  className={({ isActive }) => 
                    isActive ? 'nav-link active' : 'nav-link'
                  } 
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="bi bi-house me-1"></i>
                  Главная
                </NavLink>
              </li>
            )}
            
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => 
                  isActive ? 'nav-link active' : 'nav-link'
                } 
                to="/events"
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="bi bi-calendar-event me-1"></i>
                Мероприятия
              </NavLink>
            </li>
            
            {/* Мои бронирования - показываем только обычным пользователям */}
            {currentUser && !isAdmin && (
              <li className="nav-item">
                <NavLink 
                  className={({ isActive }) => 
                    isActive ? 'nav-link active' : 'nav-link'
                  } 
                  to="/bookings"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="bi bi-bookmark me-1"></i>
                  Мои бронирования
                </NavLink>
              </li>
            )}
            
            {isAdmin && (
              <>
                <li className="nav-item">
                  <NavLink 
                    className={({ isActive }) => 
                      isActive ? 'nav-link active' : 'nav-link'
                    } 
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className="bi bi-speedometer2 me-1"></i>
                    Панель управления
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink 
                    className={({ isActive }) => 
                      isActive ? 'nav-link active' : 'nav-link'
                    } 
                    to="/bookings"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className="bi bi-bookmark-check me-1"></i>
                    Все бронирования
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink 
                    className={({ isActive }) => 
                      isActive ? 'nav-link active' : 'nav-link'
                    } 
                    to="/events/create"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    Создать событие
                  </NavLink>
                </li>
              </>
            )}
          </ul>
          
          <ul className="navbar-nav">
            {currentUser ? (
              <>
                <li className="nav-item dropdown">
                  <div 
                    className="nav-link dropdown-toggle d-flex align-items-center" 
                    role="button" 
                    onClick={toggleDropdown}
                    aria-expanded={isDropdownOpen ? 'true' : 'false'}
                  >
                    <div 
                      className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${isAdmin ? 'bg-warning text-dark' : 'bg-light text-primary'}`}
                      style={{ width: "30px", height: "30px", fontSize: "14px" }}
                    >
                      {currentUser.name.substring(0, 1).toUpperCase()}
                    </div>
                    <span className="d-none d-md-inline">
                      {currentUser.name}
                      {isAdmin && <span className="badge bg-warning text-dark ms-2">Админ</span>}
                    </span>
                  </div>
                  <ul className={`dropdown-menu dropdown-menu-end shadow border-0 ${isDropdownOpen ? 'show' : ''}`} style={{position: 'absolute'}}>
                    <li>
                      <div className="dropdown-item-text small text-muted px-3 py-2">
                        Вы вошли как: <strong>{isAdmin ? 'Администратор' : 'Пользователь'}</strong>
                      </div>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link 
                        className="dropdown-item" 
                        to="/profile"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <i className="bi bi-person me-2"></i>
                        Профиль
                      </Link>
                    </li>
                    {!isAdmin && (
                      <li>
                        <Link 
                          className="dropdown-item" 
                          to="/bookings"
                          onClick={() => {
                            setIsMenuOpen(false);
                            setIsDropdownOpen(false);
                          }}
                        >
                          <i className="bi bi-ticket-perforated me-2"></i>
                          Мои билеты
                        </Link>
                      </li>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item text-danger" 
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Выйти
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink 
                    className={({ isActive }) => 
                      `nav-link ${isActive ? 'active' : ''}`
                    } 
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className="bi bi-box-arrow-in-right me-1"></i>
                    Вход
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink 
                    className={({ isActive }) => 
                      `btn btn-light ms-lg-2 ${isActive ? 'active' : ''}`
                    } 
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Регистрация
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 