FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json .

# --only=production 是本地调试的必要的配置，去除会报错，会出现找不到模块的问题。
# 在线上使用的时候构建的时候，需要去掉 --only=production，否则线上会报错。
# RUN npm install --only=production

RUN npm install 

COPY . .

CMD [ "node", "index.js" ]