# Backend: стандарт

Express 5 (`server/app.mjs`), Postgres через `pg`. На Vercel — `api/index.mjs`, на VPS/Docker — `server/index.mjs` (+ статика).

## Слои
- `server/lib/config.mjs` — чтение и проверка env при старте (нет обязательной переменной — процесс не стартует; сообщение содержит имена, не значения).
- `server/lib/validate.mjs` — чистая валидация входа (без БД и сети); возвращает очищенное значение или код ошибки.
- `server/lib/logger.mjs` — структурированный лог, одна JSON-строка на событие.
- `server/app.mjs` — маршруты, лимиты, SQL, Bitrix24. `server/index.mjs` — статика, запуск, graceful shutdown.
- Тесты: `npm test` (`test/*.test.mjs`, без реальной БД).

## Правила
- **Валидация**: каждое поле тела проверяется по типу и длине; не-строки отклоняются (`invalid`), не превращаются в строку. Тело JSON ≤ 32 КБ.
- **Ошибки**: всегда `{ "error": "<код>" }`. Коды: `origin` 403, `required|email|phone|track|too_long|invalid` 400, `unauthorized` 401, `not_found` 404, `rate_limit|locked` 429, `too_large` 413, `bad_request` 400, `internal` 500, `db|unavailable` 500/503. Стек и тексты исключений клиенту не отдаются.
- **БД**: только параметризованные запросы; имена таблиц/колонок — из белых списков в коде. `statement_timeout` 15 с, `connectionTimeout` 8 с, `pool.on('error')` обязателен. TLS к управляемой БД проверяется (`DB_SSL_NO_VERIFY=1` — только для самоподписанной цепочки).
- **Спам и лимиты** (публичные формы): проверка Origin (только свой хост), honeypot `_honey`, лимит в памяти + лимит в БД (по HMAC IP и по email). Вход в админку: 5 ошибок/15 мин на IP, 50 глобально.
- **CORS**: не включён намеренно. API только same-origin; кросс-доменные запросы режутся проверкой Origin и CSP.
- **Секреты**: только в env / `server/.env` / `docker.env` (все в `.gitignore`). IP хранится как HMAC, пароль — как scrypt-хэш. В логи секреты, токены и тела запросов не попадают.
- **Логи**: `log.info|warn|error(msg, {area, ...})`; у каждого запроса `X-Request-Id` (есть в ответе и в логе). `console.*` в серверном коде не использовать.
- **Health**: `GET /api/health` → 200 `{status:"ok"}` или 503 `{status:"degraded"}` при недоступной БД. Без авторизации и без данных.
- **Кеш**: `/api/*` — `Cache-Control: no-store`.

## Env
| Переменная | Обязательна | Назначение |
|---|---|---|
| `DATABASE_URL` | да | Postgres |
| `ADMIN_PASSWORD_HASH` | да | `node scripts/hash-admin-password.mjs` (scrypt) |
| `TOKEN_SECRET` | да | `openssl rand -hex 32` (≥ 32 символов, иначе предупреждение) |
| `BITRIX_WEBHOOK_URL` | нет | только https; неверный URL отключает интеграцию |
| `BITRIX_CATEGORY_ID` | нет | целое, по умолчанию 17 |
| `DB_SSL_NO_VERIFY`, `PORT`, `HOST` | нет | см. DEPLOY.md |

## Новый эндпоинт: чек-лист
1. Origin для мутирующих запросов; авторизация (`bearerOk`) для админских.
2. Валидатор в `validate.mjs` + тест в `test/`.
3. Лимит, если эндпоинт публичный и пишет в БД.
4. Ошибки только через `{error: код}`; в логе — `errFields(e)`.
