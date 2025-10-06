#!/bin/bash

# Скрипт для настройки локальной базы данных

echo "🐳 Настройка локальной базы данных для разработки..."

# Создаем .env.local файл
echo "📝 Создание .env.local файла..."
cat > .env.local << 'EOF'
# Локальная база данных PostgreSQL для разработки
DATABASE_URL="postgresql://luci_user:luci_password@localhost:5432/luci_dev?schema=public"

# Остальные переменные окружения для разработки
# (скопируйте из вашего основного .env файла, если нужно)
EOF

echo "✅ .env.local файл создан!"

# Проверяем подключение к базе данных
echo "🔍 Проверка подключения к базе данных..."
sleep 5  # Даем время базе данных полностью запуститься

# Выполняем миграции
echo "📊 Выполнение миграций Prisma..."
npx prisma migrate dev --name init

# Генерируем Prisma клиент
echo "🔧 Генерация Prisma клиента..."
npx prisma generate

echo "🎉 Настройка завершена!"
echo ""
echo "📋 Доступ к базе данных:"
echo "  - PostgreSQL: localhost:5432"
echo "  - pgAdmin: http://localhost:8080"
echo "  - Email: admin@luci.dev"
echo "  - Пароль: admin"
echo ""
echo "🚀 Теперь можно запустить приложение:"
echo "  npm run dev"
