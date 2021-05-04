# this image relies on the nodejs image
FROM node:alpine
# set working directory
WORKDIR /usr/src/analysis-service
# we need CURL to verify that the key-value storage is running (see boot-in-order.sh)
RUN apk update 
RUN apk add curl

# for textract only
RUN apk add antiword
RUN apk add poppler-utils
# RUN apk add tesseract-ocr

# let NPM packages be called anywhere within the container
ENV PATH /usr/src/analysis-service/node_modules/.bin:${PATH}
ADD package.json .
ADD src src
RUN npm install

# we now use an script to deploy the authentication service
CMD npm start
