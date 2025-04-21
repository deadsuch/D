import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Если идет проверка аутентификации, показываем загрузку
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  // Если пользователь не аутентифицирован, перенаправляем на страницу входа
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если пользователь не является администратором, перенаправляем на главную страницу
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Возвращаем защищенный контент
  return children;
};

export default AdminRoute; 