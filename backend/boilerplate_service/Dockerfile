# this image relies on the nodejs image
FROM node:alpine
# set working directory
WORKDIR /usr/src/BOILERPLATE-service
# we need CURL to verify that the key-value storage is running (see boot-in-order.sh)
RUN apk update 
RUN apk add curl
# let NPM packages be called anywhere within the container
ENV PATH /usr/src/file-service/node_modules/.bin:${PATH}
ADD package.json .
RUN npm install
# start the service
CMD npm start
