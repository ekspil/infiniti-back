FROM node:12
RUN mkdir -p /app
WORKDIR /app
COPY package-lock.json /app
COPY package.json /app
RUN npm install
COPY plugins /app/plugins
COPY public /app/public
COPY routes /app/routes
COPY services /app/services
COPY test /app/test
COPY models /app/models
COPY app.js /app
COPY .env /app
COPY server.js /app
CMD ["node", "/app/server.js"]
