# jvl-proyecto-integrado
Proyecto de final de grado de app web de Javier Valladolid Luengo 2025.

## Instrucciones para poner en funcionamiento el proyecto:

### Requisitos:

**1º Tener Docker o Docker Desktop instalado en tu dispositivo.**

**2º Tener conexión a internet.**

### Descargar archivos:

**1º Descargar el archivo `docker-compose.yaml`.**

**2º Descargar la carpeta `nginx` junto con el archivo `default.conf`. (El archivo `Dockerfile` no es necesario)**

**3º Tener el archivo `docker-compose.yaml` y la carpeta `nginx` en la misma ubicación**

**4º Ejecutar el docker compose con el comando:**

```bash
docker compose up
```

### Comprobar funcionamiento:

**Para comprobar el frontend entra en `http://localhost:4200` y accede con los siguientes parámetros:**

 - Correo: admin@gmail.com
 - Contraseña: admin123

 Una vez dentro se pueden probar a importar datos usando los archivos de la carpeta `datos`.

**Para comprobar el backend entra en `http://localhost:8000`**

**Para comprobar la base de datos puedes usar comandos o la herramienta "pgadmin" con los siguientes parámetros:**

 - Base de datos: mydb
 - Usuario: user
 - Contraseña: password
