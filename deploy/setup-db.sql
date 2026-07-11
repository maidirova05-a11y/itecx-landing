-- ITECX: подготовка базы на сервере (Forge)
-- Выполнять от postgres:  sudo -u postgres psql -f setup-db.sql
-- ПЕРЕД запуском замените ПАРОЛЬ_ЗДЕСЬ на свой (он же пойдёт в server/.env).

-- 1. Отдельная роль без прав суперпользователя
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'itecx_app') THEN
    CREATE ROLE itecx_app LOGIN PASSWORD 'ПАРОЛЬ_ЗДЕСЬ' NOSUPERUSER NOCREATEDB NOCREATEROLE;
  END IF;
END
$$;

-- 2. Отдельная база (выполнить отдельно, если скрипт ругается на транзакцию):
--    CREATE DATABASE itecx OWNER itecx_app;
SELECT 'CREATE DATABASE itecx OWNER itecx_app'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'itecx') \gexec

-- 3. Закрываем подключения к itecx для всех, кроме владельца
REVOKE CONNECT ON DATABASE itecx FROM PUBLIC;
GRANT CONNECT ON DATABASE itecx TO itecx_app;

-- 4. Таблица заявок (подключитесь к базе itecx: \c itecx)
\c itecx
SET ROLE itecx_app;

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  track text NOT NULL,
  organization text,
  message text
);
CREATE INDEX IF NOT EXISTS applications_created_at_idx ON applications (created_at DESC);
CREATE INDEX IF NOT EXISTS applications_email_idx ON applications (email);

RESET ROLE;
