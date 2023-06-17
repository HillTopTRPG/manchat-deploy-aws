FROM node:18-alpine3.16

WORKDIR /app/manchat

ENV NPM_CONFIG_PREFIX /home/node/.npm-global
ENV PATH $PATH:/home/node/.npm-global/bin

RUN apk upgrade --no-cache && \
    apk add --update --no-cache vim git make curl bash && \
    yarn global add @vue/cli

