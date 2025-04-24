FROM node:20-alpine

# Создаем рабочую директорию
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --production

# Копируем остальные файлы проекта
COPY . .

# Открываем порт 5000 для доступа к серверу
EXPOSE 5000

# Запускаем сервер
CMD ["npm", "start"] 