# Imagen base
FROM node:20-slim

# Crear carpeta de trabajo principal
WORKDIR /app

# Copiar cliente
COPY cliente/ cliente/

# Cambiar a la carpeta del servidor
WORKDIR /app/server

# Copiar solo package.json y package-lock.json para instalar dependencias
COPY server/package*.json ./

# Instalar dependencias del backend
RUN npm install

# Copiar el resto del código del backend (incluye db/notas.db)
COPY server/ .

# Exponer puerto de la aplicación
EXPOSE 3000

# Comando por defecto al ejecutar el contenedor
CMD ["node", "server.js"]

