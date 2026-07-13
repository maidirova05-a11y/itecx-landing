# Деплой ITECX на Vercel

Архитектура на Vercel: статичный сайт (Vite → `dist/`) + serverless-функция
`api/index.mjs` (весь Express API) + управляемый PostgreSQL (Neon через
Vercel Marketplace). `vercel.json` перенаправляет `/api/*` в функцию и
`/admin` на SPA.

## 1. GitHub

```bash
cd itecx-landing
git remote add origin https://github.com/ВАШ_ЛОГИН/itecx-landing.git
git push -u origin main
```

## 2. Vercel

1. vercel.com → Sign Up → **Continue with GitHub**.
2. **Add New → Project** → выберите репозиторий `itecx-landing` → Import.
3. Framework определится сам (Vite). Ничего не меняя, **не нажимайте Deploy**
   пока не добавите переменные (шаг 4) — либо задеплойте и добавьте потом
   (потребуется Redeploy).

## 3. База данных (Neon)

1. В проекте Vercel: **Storage → Create Database → Neon (Postgres)** → регион
   Frankfurt (eu-central-1) → Create. `DATABASE_URL` появится в Environment
   Variables автоматически.
2. Storage → ваша база → **Open in Neon → SQL Editor**, выполните:

```sql
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
```

## 4. Переменные окружения

Project → **Settings → Environment Variables** (для Production):

| Имя | Значение |
| --- | --- |
| `ADMIN_PASSWORD_HASH` | `REDACTED_ADMIN_PASSWORD_HASH` |
| `ADMIN_SALT` | `itecx-admin-v1` |
| `TOKEN_SECRET` | случайная строка: `openssl rand -hex 32` (или любые ~64 случайных символа) |

`DATABASE_URL` уже добавлен интеграцией Neon.

## 5. Deploy

Deployments → **Redeploy** (или просто `git push` — Vercel деплоит каждый
пуш в `main` автоматически). Сайт получит адрес `https://имя.vercel.app`.

## 6. Домен

- Купить прямо в Vercel: Project → Settings → **Domains → Buy** — DNS и
  HTTPS настроятся сами.
- Или подключить существующий: Domains → Add → у регистратора прописать
  A-запись `76.76.21.21` (или NS-серверы Vercel — тогда всё управление DNS
  переедет в Vercel).

## 7. Проверка

- `https://домен/` — лендинг, заявка с формы уходит и появляется в БД;
- `https://домен/admin` — панель организатора (пароль тот же).

## Замечания

- Локальная разработка не изменилась: `npm run dev` + `npm run server`.
- Деплой на VPS/Forge тоже работает (см. DEPLOY.md) — код общий,
  `server/index.mjs` для сервера, `api/index.mjs` для Vercel.
- Rate-limit'ы на Vercel действуют в пределах «тёплого» инстанса функции —
  для лендинга достаточно; при росте нагрузки переносятся в БД.
