// API для взаимодействия с сервером
// Используем конфигурацию из window.ENV если доступна, иначе определяем по домену
let API_URL;

if (window.ENV && window.ENV.API_URL) {
  // Используем URL из конфигурации окружения
  API_URL = window.ENV.API_URL;
} else {
  // Запасной вариант - определяем по домену
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Режим разработки - используем полный URL
    API_URL = 'http://localhost:5000/api';
  } else {
    // Продакшн или Docker - используем относительный путь
    API_URL = '/api';
  }
}

// Для отладки
console.log('API URL:', API_URL);

// Получение токена из localStorage
const getToken = () => localStorage.getItem('token');

// Установка заголовков авторизации для запросов
const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Общая функция для выполнения запросов
const fetchWithAuth = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...authHeader(),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_URL}${url}`, config);
    
    // Проверяем код статуса ответа
    if (!response.ok) {
      // Пытаемся получить детали ошибки из JSON
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // Если не можем получить JSON, используем текст ответа
        const errorText = await response.text();
        throw new Error(`Ошибка ${response.status}: ${errorText}`);
      }
      throw new Error(errorData.error || `Ошибка сервера: ${response.status}`);
    }

    // Пытаемся разобрать JSON-ответ
    const data = await response.json();
    return data;
  } catch (error) {
    // Улучшенная обработка ошибок
    console.error('API Error:', error);
    throw error;
  }
};

// Аутентификация
export const authAPI = {
  // Регистрация нового пользователя
  register: (userData) => {
    return fetchWithAuth('/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // Вход в систему
  login: (credentials) => {
    return fetchWithAuth('/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  // Получение информации о профиле
  getProfile: () => {
    return fetchWithAuth('/users/profile');
  },

  // Обновление профиля
  updateProfile: (profileData) => {
    return fetchWithAuth('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  // Изменение пароля
  changePassword: (passwords) => {
    return fetchWithAuth('/users/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwords)
    });
  }
};

// Мероприятия
export const eventsAPI = {
  // Получение всех мероприятий
  getAll: () => {
    return fetchWithAuth('/events');
  },

  // Получение одного мероприятия (по ID)
  getById: (id) => {
    return fetchWithAuth(`/events/${id}`);
  },

  // Алиас для getById для совместимости
  getEventById: (id) => {
    return fetchWithAuth(`/events/${id}`);
  },

  // Создание мероприятия (только для админа)
  create: (eventData) => {
    return fetchWithAuth('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  },

  // Обновление мероприятия (только для админа)
  update: (id, eventData) => {
    return fetchWithAuth(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
  },

  // Удаление мероприятия (только для админа)
  delete: (id) => {
    return fetchWithAuth(`/events/${id}`, {
      method: 'DELETE'
    });
  },

  // Алиас для delete для совместимости
  deleteEvent: (id) => {
    return fetchWithAuth(`/events/${id}`, {
      method: 'DELETE'
    });
  }
};

// Бронирования
export const bookingsAPI = {
  // Получение всех бронирований
  getAll: () => {
    return fetchWithAuth('/bookings');
  },

  // Получение бронирований текущего пользователя
  getUserBookings: () => {
    return fetchWithAuth('/bookings/user');
  },

  // Получение одного бронирования
  getById: (id) => {
    return fetchWithAuth(`/bookings/${id}`);
  },

  // Создание бронирования
  create: (bookingData) => {
    return fetchWithAuth('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  },

  // Алиас для create для совместимости
  createBooking: (bookingData) => {
    return fetchWithAuth('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  },

  // Обновление бронирования
  update: (id, bookingData) => {
    return fetchWithAuth(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData)
    });
  },

  // Отмена бронирования
  cancel: (id) => {
    return fetchWithAuth(`/bookings/${id}`, {
      method: 'DELETE'
    });
  },

  // Алиас для cancel для совместимости
  cancelBooking: (id) => {
    return fetchWithAuth(`/bookings/${id}`, {
      method: 'DELETE'
    });
  },
  
  // Получение электронного билета
  getTicket: (id) => {
    return fetchWithAuth(`/bookings/${id}/ticket`);
  },
  
  // Отправка билета по электронной почте
  sendTicketByEmail: (id) => {
    return fetchWithAuth(`/bookings/${id}/send-ticket`, {
      method: 'POST'
    });
  }
};

// Отзывы и рейтинги
export const reviewsAPI = {
  // Получение всех отзывов для мероприятия
  getByEventId: (eventId) => {
    return fetchWithAuth(`/reviews/event/${eventId}`);
  },
  
  // Получение отзывов пользователя
  getUserReviews: () => {
    return fetchWithAuth('/reviews/user');
  },
  
  // Создание нового отзыва
  create: (reviewData) => {
    return fetchWithAuth('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  },
  
  // Обновление отзыва
  update: (id, reviewData) => {
    return fetchWithAuth(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData)
    });
  },
  
  // Удаление отзыва
  delete: (id) => {
    return fetchWithAuth(`/reviews/${id}`, {
      method: 'DELETE'
    });
  }
};

// Система лояльности
export const loyaltyAPI = {
  // Получение баллов пользователя
  getPoints: () => {
    return fetchWithAuth('/loyalty/points');
  },
  
  // Получение истории начисления/списания баллов
  getHistory: () => {
    return fetchWithAuth('/loyalty/history');
  },
  
  // Использование баллов для скидки
  usePoints: (bookingId, points) => {
    return fetchWithAuth(`/loyalty/use`, {
      method: 'POST',
      body: JSON.stringify({ bookingId, points })
    });
  }
};

// Чат с организаторами
export const chatAPI = {
  // Получение чатов пользователя
  getUserChats: () => {
    return fetchWithAuth('/chats');
  },
  
  // Получение сообщений чата
  getMessages: (chatId) => {
    return fetchWithAuth(`/chats/${chatId}/messages`);
  },
  
  // Отправка сообщения
  sendMessage: (chatId, message) => {
    return fetchWithAuth(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  },
  
  // Создание нового чата с организатором
  createChat: (eventId) => {
    return fetchWithAuth('/chats', {
      method: 'POST',
      body: JSON.stringify({ eventId })
    });
  }
};

// Геолокация и карты
export const locationAPI = {
  // Получение данных о местоположении мероприятия
  getEventLocation: (eventId) => {
    return fetchWithAuth(`/locations/event/${eventId}`);
  },
  
  // Получение маршрута до места проведения
  getDirections: (eventId, userLocation) => {
    return fetchWithAuth(`/locations/directions`, {
      method: 'POST',
      body: JSON.stringify({ eventId, userLocation })
    });
  }
};

// Календарь событий
export const calendarAPI = {
  // Получение мероприятий для календаря
  getEvents: (startDate, endDate) => {
    return fetchWithAuth(`/calendar?start=${startDate}&end=${endDate}`);
  },
  
  // Добавление события в календарь пользователя
  addToCalendar: (eventId) => {
    return fetchWithAuth('/calendar/add', {
      method: 'POST',
      body: JSON.stringify({ eventId })
    });
  }
};

// Статистика (только для администраторов)
export const statsAPI = {
  // Получение общей статистики
  getOverview: () => {
    return fetchWithAuth('/stats');
  },
  
  // Получение статистики по мероприятиям
  getEventStats: () => {
    return fetchWithAuth('/stats/events');
  },
  
  // Получение статистики по пользователям
  getUserStats: () => {
    return fetchWithAuth('/stats/users');
  },
  
  // Получение финансовой статистики
  getFinancialStats: () => {
    return fetchWithAuth('/stats/financial');
  }
};

// Настройки приложения
export const settingsAPI = {
  // Получение глобальных настроек
  get: () => {
    return fetchWithAuth('/settings');
  },
  
  // Обновление настроек (только для администраторов)
  update: (settingsData) => {
    return fetchWithAuth('/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData)
    });
  }
};

// Объединение всех API в один объект
const apiService = {
  authAPI,
  eventsAPI,
  bookingsAPI,
  reviewsAPI,
  loyaltyAPI,
  chatAPI,
  locationAPI,
  calendarAPI,
  statsAPI,
  settingsAPI
};

export default apiService; 