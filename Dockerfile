FROM node:latest

RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

LABEL com.centurylinklabs.watchtower.enable=true

COPY . /usr/src/bot
RUN npm ci --only=production

CMD ["npm", "start"]
