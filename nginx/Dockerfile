FROM nginx:1.27

COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=javiervalladolid/jvl-proyecto-integrado-laravel:v1 /var/www/html/public /var/www/html/public