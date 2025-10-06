-- Создание дополнительных расширений для PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Создание индексов для оптимизации производительности
-- (будут созданы автоматически через Prisma миграции)
