FROM node:18-alpine as base

ENV LANG=ja_JP.UTF-8
ENV HOME=/home/node
ENV APP_HOME="$HOME/manchat-deploy-aws"

WORKDIR $APP_HOME

EXPOSE 3000

RUN apk upgrade --no-cache && \
    echo "node ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers && \
    echo "root ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers && \
    apk add --update --no-cache \
    curl git sudo python3 python3-dev && \
    curl "https://s3.amazonaws.com/aws-cli/awscli-bundle.zip" -o "awscli-bundle.zip" && \
    unzip awscli-bundle.zip && \
    rm awscli-bundle.zip && \
    sudo ./awscli-bundle/install -i /usr/local/aws -b /usr/local/bin/aws

# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#global-npm-dependencies
# npmのグローバル設定
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin
ENV NODE_ENV=development

COPY package*.json ./
COPY work/package*.json ./work/

RUN chown -R node:node .
USER node

WORKDIR work

RUN npm i -g @nestjs/cli && \
    npm i -g typescript && \
    npm i -g aws-cdk && \
    npm i
