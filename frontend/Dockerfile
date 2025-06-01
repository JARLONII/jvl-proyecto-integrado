#Usar una imagen de Node.js
FROM node

#Directorio de trabajo
WORKDIR /app

#Copiar todos los archivos
COPY . .

#Instalar las dependencias
RUN npm install

#Compilar la aplicación
RUN npm run build

#Usar Nginx para desplegar
FROM nginx

#Copiar la carpeta final de la aplicación al contenedor de Nginx
COPY --from=0 /app/dist/frontend/browser /usr/share/nginx/html

#Exponer al puerto 80
EXPOSE 80
