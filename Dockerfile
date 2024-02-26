FROM node:20.0.0
WORKDIR /app
COPY . .
RUN npm install
CMD [ "npm","start" ]
