#Imagen de PHP
FROM php:8.2-fpm

#Instalar depencencias
RUN apt-get update && apt-get install -y \
    build-essential \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    curl \
    git \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd

#Instala Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

#Carpeta de la app
WORKDIR /var/www/html

#Copiar todos los archivos
COPY . .

#Instalar composer
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

#Limpiar cache
RUN php artisan optimize:clear || true

#Dar permisos a las carpetas
RUN chown -R www-data:www-data /var/www \
    && mkdir -p /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 755 /var/www/storage \
    && chmod -R 755 /var/www/bootstrap/cache

#Exponer en el puerto 9000
EXPOSE 9000

CMD ["php-fpm"]
