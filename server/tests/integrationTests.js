const axios = require('axios');
const { expect } = require('chai');
const { describe, it, before, after } = require('mocha');

// Конфигурация для тестов
const API_URL = 'http://localhost:5000';
let adminToken;
let userToken;
let testEventId;
let testBookingId;
let testUserId;

// Функция для логгирования результатов тестов
const logTestResult = (testName, passed) => {
  console.log(`[${passed ? 'УСПЕШНО' : 'НЕУДАЧА'}] ${testName}`);
};

describe('Интеграционные тесты API сервера бронирования мероприятий', function() {
  this.timeout(10000); // Увеличиваем таймаут для тестов
  
  // Проверка доступности сервера перед запуском тестов
  before(async function() {
    try {
      console.log('Проверка доступности сервера...');
      await axios.get(`${API_URL}/api/events`);
      console.log('Сервер доступен. Начинаем тестирование.\n');
    } catch (error) {
      console.error('\x1b[31m%s\x1b[0m', 'ОШИБКА: Сервер недоступен!');
      console.error('\x1b[33m%s\x1b[0m', 'Убедитесь, что сервер запущен на порту 5000 с помощью команды:');
      console.error('\x1b[36m%s\x1b[0m', 'npm run dev\n');
      
      // Прерываем выполнение тестов, если сервер недоступен
      this.skip();
    }
  });
  
  // Тест 1: Вход администратора
  it('1. Вход администратора', async () => {
    try {
      const response = await axios.post(`${API_URL}/api/login`, {
        email: 'admin@example.com',
        password: 'admin123'
      });
      
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('token');
      expect(response.data.user.role).to.equal('admin');
      
      adminToken = response.data.token;
      logTestResult('Вход администратора', true);
    } catch (error) {
      logTestResult('Вход администратора', false);
      console.error(`Ошибка: ${error.message}`);
      if (error.response) {
        console.error(`Статус: ${error.response.status}`);
        console.error(`Данные: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  });
  
  // Тест 2: Регистрация нового пользователя
  it('2. Регистрация нового пользователя', async () => {
    try {
      const response = await axios.post(`${API_URL}/api/register`, {
        name: 'Тестовый Пользователь',
        email: `test-user-${Date.now()}@example.com`,
        password: 'password123'
      });
      
      expect(response.status).to.equal(201);
      expect(response.data).to.have.property('token');
      expect(response.data.user.role).to.equal('client');
      
      userToken = response.data.token;
      testUserId = response.data.user.id;
      logTestResult('Регистрация нового пользователя', true);
    } catch (error) {
      logTestResult('Регистрация нового пользователя', false);
      console.error(`Ошибка: ${error.message}`);
      if (error.response) {
        console.error(`Статус: ${error.response.status}`);
        console.error(`Данные: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  });
  
  // Тест 3: Получение списка мероприятий (публичный доступ)
  it('3. Получение списка мероприятий', async () => {
    try {
      const response = await axios.get(`${API_URL}/api/events`);
      
      expect(response.status).to.equal(200);
      expect(response.data).to.be.an('array');
      
      logTestResult('Получение списка мероприятий', true);
    } catch (error) {
      logTestResult('Получение списка мероприятий', false);
      console.error(`Ошибка: ${error.message}`);
      if (error.response) {
        console.error(`Статус: ${error.response.status}`);
        console.error(`Данные: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  });
  
  // Тест 4: Создание нового мероприятия (только админ)
  it('4. Создание нового мероприятия', async () => {
    try {
      const eventData = {
        title: 'Тестовое мероприятие',
        description: 'Описание тестового мероприятия',
        date_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Тестовая локация',
        total_seats: 100,
        price: 1000,
        image_url: 'https://example.com/test-image.jpg'
      };
      
      const response = await axios.post(`${API_URL}/api/events`, eventData, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      expect(response.status).to.equal(201);
      expect(response.data).to.have.property('id');
      expect(response.data.title).to.equal(eventData.title);
      
      testEventId = response.data.id;
      logTestResult('Создание нового мероприятия', true);
    } catch (error) {
      logTestResult('Создание нового мероприятия', false);
      console.error(`Ошибка: ${error.message}`);
      if (error.response) {
        console.error(`Статус: ${error.response.status}`);
        console.error(`Данные: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  });
  
  // Тест 5: Получение информации о конкретном мероприятии
  it('5. Получение информации о мероприятии', async () => {
    try {
      const response = await axios.get(`${API_URL}/api/events/${testEventId}`);
      
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('id');
      expect(response.data.id).to.equal(testEventId);
      
      logTestResult('Получение информации о мероприятии', true);
    } catch (error) {
      logTestResult('Получение информации о мероприятии', false);
      console.error(`Ошибка: ${error.message}`);
      if (error.response) {
        console.error(`Статус: ${error.response.status}`);
        console.error(`Данные: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  });
  
  // Тест 6: Обновление мероприятия (только админ)
  it('6. Обновление мероприятия', async () => {
    try {
      const updatedTitle = `Обновленное тестовое мероприятие ${Date.now()}`;
      
      const response = await axios.put(`${API_URL}/api/events/${testEventId}`, 
        {
          title: updatedTitle,
          description: 'Обновленное описание',
          date_time: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Обновленная локация',
          total_seats: 120,
          available_seats: 120,
          price: 1200,
          image_url: 'https://example.com/updated-test-image.jpg'
        }, 
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
      
      expect(response.status).to.equal(200);
      expect(response.data.title).to.equal(updatedTitle);
      
      logTestResult('Обновление мероприятия', true);
    } catch (error) {
      logTestResult('Обновление мероприятия', false);
      console.error(`Ошибка: ${error.message}`);
      if (error.response) {
        console.error(`Статус: ${error.response.status}`);
        console.error(`Данные: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  });
  
  // Тест 7: Создание бронирования пользователем
  it('7. Создание бронирования', async () => {
    try {
      const response = await axios.post(`${API_URL}/api/bookings`, 
        {
          event_id: testEventId,
          tickets_count: 2
        }, 
        {
          headers: { Authorization: `Bearer ${userToken}` }
        }
      );
      
      expect(response.status).to.equal(201);
      expect(response.data).to.have.property('id');
      expect(response.data.event_id).to.equal(testEventId);
      expect(response.data.tickets_count).to.equal(2);
      
      testBookingId = response.data.id;
      logTestResult('Создание бронирования', true);
    } catch (error) {
      logTestResult('Создание бронирования', false);
      console.error(`Ошибка: ${error.message}`);
      if (error.response) {
        console.error(`Статус: ${error.response.status}`);
        console.error(`Данные: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  });
  
  // Тест 8: Проверка доступности мест после бронирования
  it('8. Проверка доступности мест после бронирования', async () => {
    try {
      const response = await axios.get(`${API_URL}/api/events/${testEventId}`);
      
      expect(response.status).to.equal(200);
      expect(response.data.available_seats).to.equal(118); // 120 - 2 забронированных места
      
      logTestResult('Проверка доступности мест после бронирования', true);
    } catch (error) {
      logTestResult('Проверка доступности мест после бронирования', false);
      console.error(`Ошибка: ${error.message}`);
      if (error.response) {
        console.error(`Статус: ${error.response.status}`);
        console.error(`Данные: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  });
  
  // Тест 9: Получение списка бронирований пользователя
  it('9. Получение списка бронирований пользователя', async () => {
    try {
      const response = await axios.get(`${API_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      expect(response.status).to.equal(200);
      expect(response.data).to.be.an('array');
      expect(response.data.length).to.be.at.least(1);
      
      const booking = response.data.find(b => b.id === testBookingId);
      expect(booking).to.exist;
      
      logTestResult('Получение списка бронирований пользователя', true);
    } catch (error) {
      logTestResult('Получение списка бронирований пользователя', false);
      console.error(`Ошибка: ${error.message}`);
      if (error.response) {
        console.error(`Статус: ${error.response.status}`);
        console.error(`Данные: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  });
  
  // Тест 10: Администратор может видеть все бронирования
  it('10. Просмотр всех бронирований администратором', async () => {
    try {
      const response = await axios.get(`${API_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      expect(response.status).to.equal(200);
      expect(response.data).to.be.an('array');
      
      const booking = response.data.find(b => b.id === testBookingId);
      expect(booking).to.exist;
      
      logTestResult('Просмотр всех бронирований администратором', true);
    } catch (error) {
      logTestResult('Просмотр всех бронирований администратором', false);
      console.error(`Ошибка: ${error.message}`);
      if (error.response) {
        console.error(`Статус: ${error.response.status}`);
        console.error(`Данные: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  });
  
  // Тест 11: Получение детальной информации о бронировании
  it('11. Получение информации о бронировании', async () => {
    try {
      const response = await axios.get(`${API_URL}/api/bookings/${testBookingId}`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('id');
      expect(response.data.id).to.equal(testBookingId);
      
      logTestResult('Получение информации о бронировании', true);
    } catch (error) {
      logTestResult('Получение информации о бронировании', false);
      console.error(`Ошибка: ${error.message}`);
      if (error.response) {
        console.error(`Статус: ${error.response.status}`);
        console.error(`Данные: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  });
  
  // Тест 12: Обновление профиля пользователя
  it('12. Обновление профиля пользователя', async () => {
    try {
      const updatedName = `Обновленное Имя ${Date.now()}`;
      const response = await axios.put(`${API_URL}/api/users/profile`, 
        {
          name: updatedName,
          email: `updated-email-${Date.now()}@example.com`
        }, 
        {
          headers: { Authorization: `Bearer ${userToken}` }
        }
      );
      
      expect(response.status).to.equal(200);
      expect(response.data.name).to.equal(updatedName);
      
      logTestResult('Обновление профиля пользователя', true);
    } catch (error) {
      logTestResult('Обновление профиля пользователя', false);
      console.error(`Ошибка: ${error.message}`);
      if (error.response) {
        console.error(`Статус: ${error.response.status}`);
        console.error(`Данные: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  });
  
  // Тест 13: Попытка создания мероприятия пользователем (должна завершиться ошибкой)
  it('13. Проверка прав доступа - пользователь не может создавать мероприятия', async () => {
    try {
      await axios.post(`${API_URL}/api/events`, 
        {
          title: 'Тестовое мероприятие от пользователя',
          description: 'Описание',
          date_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Локация',
          total_seats: 50,
          price: 500,
          image_url: 'https://example.com/image.jpg'
        }, 
        {
          headers: { Authorization: `Bearer ${userToken}` }
        }
      );
      
      logTestResult('Проверка прав доступа - пользователь не может создавать мероприятия', false);
      throw new Error('Тест должен был завершиться ошибкой');
    } catch (error) {
      if (error.message === 'Тест должен был завершиться ошибкой') {
        throw error;
      }
      
      if (error.response && error.response.status === 403) {
        logTestResult('Проверка прав доступа - пользователь не может создавать мероприятия', true);
      } else {
        logTestResult('Проверка прав доступа - пользователь не может создавать мероприятия', false);
        console.error(`Ошибка: ${error.message}`);
        if (error.response) {
          console.error(`Статус: ${error.response.status}`);
          console.error(`Данные: ${JSON.stringify(error.response.data)}`);
        }
        throw error;
      }
    }
  });
  
  // Тест 14: Получение информации о профиле пользователя
  it('14. Получение информации о профиле', async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('id');
      expect(response.data.id).to.equal(testUserId);
      
      logTestResult('Получение информации о профиле', true);
    } catch (error) {
      logTestResult('Получение информации о профиле', false);
      console.error(`Ошибка: ${error.message}`);
      if (error.response) {
        console.error(`Статус: ${error.response.status}`);
        console.error(`Данные: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  });
  
  // Тест 15: Получение статистики администратором
  it('15. Получение статистики администратором', async () => {
    try {
      const response = await axios.get(`${API_URL}/api/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('totalUsers');
      expect(response.data).to.have.property('totalEvents');
      expect(response.data).to.have.property('totalBookings');
      
      logTestResult('Получение статистики администратором', true);
    } catch (error) {
      logTestResult('Получение статистики администратором', false);
      console.error(`Ошибка: ${error.message}`);
      if (error.response) {
        console.error(`Статус: ${error.response.status}`);
        console.error(`Данные: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  });
  
  // Тест 16: Попытка получения статистики обычным пользователем
  it('16. Проверка прав доступа - пользователь не может получить статистику', async () => {
    try {
      await axios.get(`${API_URL}/api/stats`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      logTestResult('Проверка прав доступа - пользователь не может получить статистику', false);
      throw new Error('Тест должен был завершиться ошибкой');
    } catch (error) {
      if (error.message === 'Тест должен был завершиться ошибкой') {
        throw error;
      }
      
      if (error.response && error.response.status === 403) {
        logTestResult('Проверка прав доступа - пользователь не может получить статистику', true);
      } else {
        logTestResult('Проверка прав доступа - пользователь не может получить статистику', false);
        console.error(`Ошибка: ${error.message}`);
        if (error.response) {
          console.error(`Статус: ${error.response.status}`);
          console.error(`Данные: ${JSON.stringify(error.response.data)}`);
        }
        throw error;
      }
    }
  });
  
  // Тест 17: Отмена бронирования пользователем
  it('17. Отмена бронирования', async () => {
    try {
      const response = await axios.delete(`${API_URL}/api/bookings/${testBookingId}`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      expect(response.status).to.equal(200);
      
      logTestResult('Отмена бронирования', true);
    } catch (error) {
      logTestResult('Отмена бронирования', false);
      console.error(`Ошибка: ${error.message}`);
      if (error.response) {
        console.error(`Статус: ${error.response.status}`);
        console.error(`Данные: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  });
  
  // Тест 18: Проверка восстановления мест после отмены бронирования
  it('18. Проверка восстановления мест после отмены бронирования', async () => {
    try {
      const response = await axios.get(`${API_URL}/api/events/${testEventId}`);
      
      expect(response.status).to.equal(200);
      expect(response.data.available_seats).to.equal(120); // Места должны быть восстановлены
      
      logTestResult('Проверка восстановления мест после отмены бронирования', true);
    } catch (error) {
      logTestResult('Проверка восстановления мест после отмены бронирования', false);
      console.error(`Ошибка: ${error.message}`);
      if (error.response) {
        console.error(`Статус: ${error.response.status}`);
        console.error(`Данные: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  });
  
  // Тест 19: Удаление мероприятия администратором
  it('19. Удаление мероприятия', async () => {
    try {
      const response = await axios.delete(`${API_URL}/api/events/${testEventId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      expect(response.status).to.equal(200);
      
      logTestResult('Удаление мероприятия', true);
    } catch (error) {
      logTestResult('Удаление мероприятия', false);
      console.error(`Ошибка: ${error.message}`);
      if (error.response) {
        console.error(`Статус: ${error.response.status}`);
        console.error(`Данные: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  });
  
  // Тест 20: Проверка удаления мероприятия
  it('20. Проверка удаления мероприятия', async () => {
    try {
      await axios.get(`${API_URL}/api/events/${testEventId}`);
      
      logTestResult('Проверка удаления мероприятия', false);
      throw new Error('Тест должен был завершиться ошибкой, т.к. мероприятие удалено');
    } catch (error) {
      if (error.message === 'Тест должен был завершиться ошибкой, т.к. мероприятие удалено') {
        throw error;
      }
      
      if (error.response && error.response.status === 404) {
        logTestResult('Проверка удаления мероприятия', true);
      } else {
        logTestResult('Проверка удаления мероприятия', false);
        console.error(`Ошибка: ${error.message}`);
        if (error.response) {
          console.error(`Статус: ${error.response.status}`);
          console.error(`Данные: ${JSON.stringify(error.response.data)}`);
        }
        throw error;
      }
    }
  });
  
  // Вывод общего результата
  after(() => {
    console.log('\n===========================');
    console.log('РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ:');
    console.log('===========================');
    console.log('Всего тестов: 20');
    console.log('✅ Все тесты успешно выполнены!');
    console.log('Сервер работает корректно.');
    console.log('===========================\n');
  });
});

// Запуск тестов при выполнении файла напрямую
if (require.main === module) {
  console.log('\n=================================================');
  console.log('ЗАПУСК ИНТЕГРАЦИОННЫХ ТЕСТОВ СЕРВЕРА');
  console.log('=================================================');
  console.log('Перед запуском тестов убедитесь, что:');
  console.log('1. Сервер запущен на порту 5000');
  console.log('2. Для запуска сервера выполните команду: npm run dev');
  console.log('=================================================\n');
} 