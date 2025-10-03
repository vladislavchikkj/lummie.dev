# 🐳 Настройка локальной базы данных в Docker

## ✅ Готово! Локальная база данных настроена

### 🚀 Быстрый старт

#### 1. Запуск PostgreSQL

```bash
# Запустить контейнеры
docker-compose up -d

# Проверить статус
docker-compose ps
```

#### 2. Настройка базы данных (уже выполнено)

```bash
# Выполнить миграции
npx prisma migrate dev

# Сгенерировать Prisma клиент
npx prisma generate
```

#### 3. Запуск приложения

```bash
npm run dev
```

## Доступ к базе данных

### PostgreSQL

- **Хост:** localhost
- **Порт:** 5432
- **База данных:** luci_dev
- **Пользователь:** luci_user
- **Пароль:** luci_password

### pgAdmin (веб-интерфейс)

- **URL:** http://localhost:8080
- **Email:** admin@luci.dev
- **Пароль:** admin

## Полезные команды

```bash
# Остановить контейнеры
docker-compose down

# Остановить и удалить данные
docker-compose down -v

# Просмотр логов
docker-compose logs postgres

# Подключение к базе через psql
docker-compose exec postgres psql -U luci_user -d luci_dev
```

## Структура данных

База данных будет автоматически создана с помощью Prisma миграций на основе `prisma/schema.prisma`.

## Остановка

```bash
# Остановить все контейнеры
docker-compose down

# Остановить и удалить все данные (ОСТОРОЖНО!)
docker-compose down -v
```
