FROM node:10
WORKDIR /home/node-hmg
COPY package*.json ./
COPY yarn.lock ./
RUN yarn
COPY . .
RUN yarn build
EXPOSE 8080
CMD [ "yarn", "start" ]
