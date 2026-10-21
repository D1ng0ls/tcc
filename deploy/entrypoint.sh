#!/bin/sh
set -e

# Usuário do PHP-FPM/Nginx
APP_USER=www-data
APP_GROUP=www-data

cd /var/www/html

# Garante diretórios essenciais
mkdir -p storage/app/public \
         storage/framework/{cache,sessions,views} \
         storage/logs \
         bootstrap/cache

# Ajusta dono (idempotente e rápido quando já correto)
chown -R "$APP_USER:$APP_GROUP" storage bootstrap/cache

# Permissões seguras: dono/grupo rwx
chmod -R ug+rwX storage bootstrap/cache

# Migrations (idempotente)
php artisan migrate --force --no-interaction || true

# Link de storage (ignora se já existe)
php artisan storage:link >/dev/null 2>&1 || true

# php artisan db:seed --force --no-interaction || true

# Caches/optimize (com env real)
php artisan config:cache
php artisan route:cache
php artisan event:cache
php artisan view:cache
php artisan optimize

# Agendador do Laravel (routes/console.php — ex.: ranking diário). A imagem não tem
# cron, então um laço em segundo plano roda schedule:run a cada minuto, como www-data
# (mesmo dono de storage/, para não criar arquivos de log como root).
su -s /bin/sh www-data -c 'while true; do php /var/www/html/artisan schedule:run --no-interaction >> /var/www/html/storage/logs/scheduler.log 2>&1; sleep 60; done' &

php-fpm -D

exec nginx -g "daemon off;"
