.PHONY: start-dev start-docker stop-docker logs-docker build-docker clean-docker test-server help

# Запуск без Docker (режим разработки)
start-dev:
	@echo "Запуск сервера в режиме разработки..."
	cd server && npm run dev & \
	echo "Запуск клиента в режиме разработки..." && \
	cd client && npm start

# Docker команды
start-docker:
	@echo "Запуск проекта в Docker..."
	docker-compose up -d
	@echo "Проект запущен на http://localhost"

stop-docker:
	@echo "Остановка Docker контейнеров..."
	docker-compose down

logs-docker:
	@echo "Просмотр логов Docker контейнеров..."
	docker-compose logs -f

build-docker:
	@echo "Сборка Docker образов..."
	docker-compose build --no-cache

clean-docker:
	@echo "Удаление Docker образов проекта..."
	docker-compose down --rmi all

# Тестирование
test-server:
	@echo "Запуск интеграционных тестов сервера..."
	cd server && npm test

# Помощь
help:
	@echo "Доступные команды:"
	@echo "  make start-dev      - Запуск проекта в режиме разработки без Docker"
	@echo "  make start-docker   - Запуск проекта в Docker"
	@echo "  make stop-docker    - Остановка Docker контейнеров"
	@echo "  make logs-docker    - Просмотр логов Docker контейнеров"
	@echo "  make build-docker   - Пересборка Docker образов"
	@echo "  make clean-docker   - Удаление Docker образов проекта"
	@echo "  make test-server    - Запуск интеграционных тестов сервера"
	@echo "  make help           - Показать эту справку"

# Команда по умолчанию
.DEFAULT_GOAL := help 