FROM node:16.17.1-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install -g prisma && prisma generate

COPY prisma/schema.prisma ./prisma/schema.prisma

EXPOSE 3000

CMD [ "npm", "start" ]

