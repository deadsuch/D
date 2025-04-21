import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../api';

// Создаем контекст аутентификации
const AuthContext = createContext();

// Кастомный хук для использования контекста аутентификации
export const useAuth = () => useContext(AuthContext);

// Провайдер контекста аутентификации
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Проверяем, авторизован ли пользователь, при загрузке компонента
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      if (token) {
        try {
          const userData = await authAPI.getProfile();
          setCurrentUser(userData);
        } catch (err) {
          console.error('Ошибка проверки авторизации:', err);
          // Если токен недействителен, очищаем данные
          logout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    checkUserLoggedIn();
  }, [token]);

  // Регистрация нового пользователя
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.register({ name, email, password });
      
      // Сохраняем токен в localStorage
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setCurrentUser(response.user);
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Вход в систему
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login({ email, password });
      
      // Сохраняем токен в localStorage
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setCurrentUser(response.user);
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Выход из системы
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  };

  // Обновление профиля
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await authAPI.updateProfile(profileData);
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Изменение пароля
  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.changePassword({
        currentPassword,
        newPassword
      });
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Проверка, является ли пользователь администратором
  const isAdmin = currentUser?.role === 'admin';

  // Значение контекста
  const value = {
    currentUser,
    isAdmin,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 