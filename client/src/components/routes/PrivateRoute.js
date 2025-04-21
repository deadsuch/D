import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Если идет проверка аутентификации, показываем загрузку
  if (loading) {
    return <div className="text-center">Загрузка...</div>;
  }

  // Если пользователь не аутентифицирован, перенаправляем на страницу входа
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если маршрут только для админа и пользователь не админ, перенаправляем на главную
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Если все проверки пройдены, показываем содержимое маршрута
  return children;
};

export default PrivateRoute; 