# Деплой ITECX на Forge

Стек: статичный фронтенд (Vite) + Node API (`server/index.mjs`) + PostgreSQL.
Node-приложение само раздаёт собранный сайт и обслуживает `/api` и `/admin`,
nginx лишь проксирует к нему.

## 0. Что понадобится

- Репозиторий на GitHub/GitLab (Forge деплоит из git) — проект уже
  подготовлен, осталось `git push` (см. шаг 1)
- На сервере: Node.js 20+ и PostgreSQL (оба ставятся из панели Forge,
  если ещё не стоят: Server → PHP/Node — Install Node, Server → Database)

## 1. Репозиторий

```bash
cd itecx-landing
git remote add origin git@github.com:ВАШ_АККАУНТ/itecx-landing.git
git push -u origin main
```

Секреты в git не попадают: `.env` и `server/.env` в `.gitignore`.

## 2. База данных на сервере

SSH на сервер (или Forge → Server → Database для создания БД/пользователя из
панели), затем:

```bash
sudo -u postgres psql
```

Выполните содержимое `deploy/setup-db.sql`, предварительно заменив
`ПАРОЛЬ_ЗДЕСЬ` на надёжный пароль. Скрипт создаёт роль `itecx_app`, базу
`itecx` (доступную ТОЛЬКО этой роли) и таблицу заявок. Если на этом же
сервере живут другие базы — они изолированы: `itecx_app` не может к ним
даже подключиться.

## 3. Сайт в Forge

1. **Sites → New Site**: домен, тип **Static HTML** (тип не важен — nginx
   всё равно заменим), Web Directory оставьте любой.
2. **Site → App → Install Repository**: укажите репозиторий и ветку `main`.
3. **Site → Edit Nginx Configuration**: замените блок `location / { … }`
   содержимым `deploy/forge-nginx.conf`.

## 4. Секреты (server/.env на сервере)

```bash
ssh forge@СЕРВЕР
cd /home/forge/ВАШ_ДОМЕН
cp server/.env.example server/.env
nano server/.env
```

Заполните:

```
DATABASE_URL=postgresql://itecx_app:ПАРОЛЬ_ИЗ_ШАГА_2@localhost:5432/itecx
ADMIN_PASSWORD_HASH=ХЭШ_ПАРОЛЯ_АДМИНА
ADMIN_SALT=СЛУЧАЙНАЯ_СОЛЬ
TOKEN_SECRET=СЛУЧАЙНАЯ_СТРОКА   # openssl rand -hex 32
PORT=3001
```

`ADMIN_PASSWORD_HASH` — это SHA-256 от `ADMIN_SALT::пароль`. Чтобы получить хэш
для нового пароля: `echo -n 'ВАШ_SALT::НовыйПароль' | sha256sum`.

## 5. Демон Node

**Server → Daemons → New Daemon:**

- Command: `node server/index.mjs`
- Directory: `/home/forge/ВАШ_ДОМЕН`
- User: `forge`

Запомните ID созданного демона (`daemon-XXXXXX`).

## 6. Скрипт деплоя

**Site → Deployments → Deploy Script** — вставьте `deploy/forge-deploy.sh`,
подставив ID демона из шага 5. Включите **Quick Deploy**, чтобы каждый
`git push` выкатывался автоматически. Нажмите **Deploy Now**.

## 7. HTTPS

**Site → SSL → LetsEncrypt** — бесплатный сертификат в один клик.

## Проверка

- `https://домен/` — лендинг
- `https://домен/admin` — панель организатора (ссылок на неё на сайте нет)
- заявка с формы появляется в панели и дублируется на почту

## Как это работает под капотом

```
интернет → nginx (Forge, 443) → 127.0.0.1:3001 (Node, systemd-демон)
                                   ├─ статика из dist/
                                   ├─ POST /api/applications → PostgreSQL (itecx)
                                   ├─ POST /api/admin/login  → выдача токена
                                   └─ GET  /api/applications → только с токеном
```

Порт 3001 наружу не открыт (Node слушает только 127.0.0.1), пароль админки
хранится хэшем, перебор блокируется по IP, у заявок трёхуровневый анти-спам.
