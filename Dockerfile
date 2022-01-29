FROM node:latest

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

LABEL com.centurylinklabs.watchtower.enable=true

COPY . /usr/src/bot
RUN pnpm install --frozen-lockfile --prod

CMD ["npm", "start"]
