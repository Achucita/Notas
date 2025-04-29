FROM node:20-slim

WORKDIR /app

COPY cliente ./cliente

WORKDIR /app/server

COPY server/package*.json ./
RUN npm install

COPY server ./

EXPOSE 3000
CMD ["node", "server.js"]
