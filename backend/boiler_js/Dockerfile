# this image relies on the nodejs image
FROM node:alpine
# set working directory
WORKDIR /usr/src/boiler-service
# we need CURL to verify that the key-value storage is running (see boot-in-order.sh)
RUN apk update 
RUN apk add curl

# let NPM packages be called anywhere within the container
ENV PATH /usr/src/boiler-service/node_modules/.bin:${PATH}
ADD package.json .
ADD src src
RUN npm install

# we now use an script to deploy the authentication service
CMD npm start