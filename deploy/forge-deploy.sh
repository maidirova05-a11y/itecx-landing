# ITECX — скрипт деплоя для Forge → Site → Deployments → Deploy Script.
# $FORGE_SITE_PATH и $FORGE_SITE_BRANCH Forge подставляет сам.

cd $FORGE_SITE_PATH
git pull origin $FORGE_SITE_BRANCH

npm ci
npm run build

# Перезапуск Node-демона (создаётся в Forge → Server → Daemons).
# Подставьте свой ID демона вместо XXXXXX — он виден в панели рядом с демоном,
# либо выполните на сервере: sudo supervisorctl status | grep daemon
sudo -S supervisorctl restart daemon-XXXXXX:* || true
