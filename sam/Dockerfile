FROM python:3.9-slim-buster
# Install awscli and aws-sam-cli
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends git curl sudo && \
    apt-get purge -y --auto-remove

RUN curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash - && \
    sudo apt-get install -y nodejs npm && \
    npm i -g esbuild wscat

RUN pip install --upgrade pip && \
    pip install --no-cache-dir awscli aws-sam-cli docker

WORKDIR /sam