FROM python:3.9-slim-buster
# Install awscli and aws-sam-cli
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends git curl sudo && \
    apt-get purge -y --auto-remove

RUN pip install --upgrade pip && \
    pip install --no-cache-dir awscli aws-sam-cli docker

WORKDIR /sam