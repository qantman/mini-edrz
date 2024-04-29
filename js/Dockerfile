FROM node:14 as build-stage

RUN apt-get update
RUN apt-get install -y locales
RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
  sed -i -e 's/# ru_RU.UTF-8 UTF-8/ru_RU.UTF-8 UTF-8/' /etc/locale.gen  && \
  dpkg-reconfigure --frontend=noninteractive locales  && \
  update-locale LANG=ru_RU.UTF-8  && \
  rm /etc/localtime && \
  ln -s /usr/share/zoneinfo/Europe/Moscow /etc/localtime && \
  dpkg-reconfigure --frontend noninteractive tzdata && \
  mkdir -p /app/server

WORKDIR /app/server
COPY package*.json ./
RUN npm install --production && npm audit fix --force
COPY . .
RUN mkdir -p public/records
EXPOSE 8081
