FROM node:current-alpine

RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

LABEL com.centurylinklabs.watchtower.enable=true

COPY . /usr/src/bot
RUN npm install

CMD ["npm", "start"]
