# -------- Stage 1: PHP + Composer ----------
FROM php:8.4-fpm AS phpbase

RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libicu-dev libonig-dev \
 && docker-php-ext-install zip intl pcntl bcmath pdo_mysql

RUN curl -sS https://getcomposer.org/installer | php -- \
    --install-dir=/usr/local/bin --filename=composer

WORKDIR /var/www/html

COPY composer.json composer.lock* ./
RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --optimize-autoloader \
    --no-scripts

COPY . .

# -------- Stage 2: Assets (PHP + Node) ----------
FROM phpbase AS assets

RUN apt-get update && apt-get install -y curl ca-certificates \
 && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
 && apt-get install -y nodejs

WORKDIR /var/www/html

RUN npm ci || npm install \
 && npm run build

# -------- Stage 3: Final (PHP-FPM + Nginx) ----------
FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    nginx \
    libzip-dev libicu-dev libonig-dev \
 && docker-php-ext-install zip intl pcntl bcmath pdo_mysql \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

# Código + vendor
COPY --from=phpbase /var/www/html /var/www/html

# Assets buildados
COPY --from=assets /var/www/html/public/build /var/www/html/public/build

# Nginx + entrypoint
COPY ./deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./deploy/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8000
CMD ["/usr/local/bin/entrypoint.sh"]
