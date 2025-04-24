// Этот файл генерируется автоматически при сборке в зависимости от окружения
window.ENV = {
  API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'  // для разработки
    : '/api'                       // для продакшна и Docker
}; 