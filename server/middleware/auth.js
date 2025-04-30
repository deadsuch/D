const jwt = require('jsonwebtoken');
const JWT_SECRET = 'event-booking-secret-key'; // В реальном проекте храните в .env

// Middleware для проверки авторизации
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Требуется авторизация' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Ошибка верификации токена:', err.message);
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// Middleware для проверки роли администратора
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Недостаточно прав' });
  }
  next();
};

module.exports = {
  authenticateToken,
  isAdmin,
  JWT_SECRET
}; 