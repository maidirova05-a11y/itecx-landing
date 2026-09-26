#!/usr/bin/env bash
# Проверка Docker-версии: собрать, поднять и убедиться, что сайт, API заявок
# и админка работают. Запускается в CI (.github/workflows/docker.yml), можно
# и руками на сервере после восстановления.
#
#   docker/smoke.sh          собрать, поднять, проверить
#   docker/smoke.sh check    только проверить уже запущенное
set -euo pipefail
cd "$(dirname "$0")/.."

PORT=${APP_PORT:-3103}
BASE=http://127.0.0.1:$PORT
CI_PASSWORD=ci-admin-password-123
CI_MARK="# создан docker/smoke.sh — тестовые секреты"
FAIL=0

if [ "${1:-}" != check ]; then
  if [ ! -f docker.env ]; then
    # Тестовые секреты — только для проверки, не для боевого запуска.
    # Хэш — тот же формат, что у scripts/hash-admin-password.mjs.
    {
      echo "$CI_MARK"
      grep -vE '^(ADMIN_PASSWORD_HASH|TOKEN_SECRET)=' docker.env.example
      node -e "const c=require('crypto'),s=c.randomBytes(16);console.log('ADMIN_PASSWORD_HASH=scrypt:'+s.toString('hex')+':'+c.scryptSync(process.argv[1],s,32,{N:16384,r:8,p:1,maxmem:64*1024*1024}).toString('hex'))" "$CI_PASSWORD"
      echo "TOKEN_SECRET=$(openssl rand -hex 32)"
    } > docker.env
  fi
  docker compose up -d --build
fi

for _ in $(seq 1 90); do
  curl -sf -o /dev/null "$BASE/robots.txt" && break
  sleep 2
done

ok() { echo "  ✓ $*"; }
bad() { echo "  ✗ $*"; FAIL=1; }
expect() { # expect <код> <путь> [curl-аргументы…]
  local want=$1 path=$2; shift 2
  local got; got=$(curl -s -o /dev/null -w '%{http_code}' "$@" "$BASE$path")
  [ "$got" = "$want" ] && ok "$path → $got" || bad "$path → $got (ожидалось $want)"
}

echo "itecx: $BASE"
for p in / /kk /en /privacy /kk/privacy /en/privacy /admin /robots.txt /sitemap.xml; do expect 200 "$p"; done
grep -q '<html lang="kk"' <<<"$(curl -s "$BASE/kk")" && ok "/kk — казахская версия" || bad "/kk не на казахском"

# Заявка идёт через проверку Origin и пишется в базу.
EMAIL="smoke-$RANDOM$RANDOM@example.com"
expect 200 /api/applications -X POST -H "Origin: $BASE" -H 'Content-Type: application/json' \
  -H "X-Forwarded-For: 198.51.100.$((RANDOM % 250))" \
  --data "{\"firstName\":\"Проверка\",\"lastName\":\"Докер\",\"email\":\"$EMAIL\",\"track\":\"ITECX college\"}"

if [ -n "${SMOKE_ADMIN_PASSWORD:-}" ] || grep -qx "$CI_MARK" docker.env; then
  TOKEN=$(curl -s -X POST "$BASE/api/admin/login" -H "Origin: $BASE" -H 'Content-Type: application/json' \
    -H "X-Forwarded-For: 203.0.113.$((RANDOM % 250))" \
    --data "{\"password\":\"${SMOKE_ADMIN_PASSWORD:-$CI_PASSWORD}\"}" | sed -nE 's/.*"token":"([^"]+)".*/\1/p')
  [ -n "$TOKEN" ] && ok "вход в админку" || bad "вход в админку не удался"
  grep -q "$EMAIL" <<<"$(curl -s "$BASE/api/applications" -H "Authorization: Bearer $TOKEN")" \
    && ok "заявка видна в админке" || bad "заявки нет в списке"
fi

if [ "$FAIL" -ne 0 ]; then
  docker compose ps -a
  docker compose logs --tail 80
  exit 1
fi
echo "itecx: всё работает"
