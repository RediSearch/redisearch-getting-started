FROM node:lts-alpine

# install simple http server for serving static content
RUN npm install -g http-server

# make the 'app' folder the current working directory
WORKDIR /app

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./

# Environment Variables
ARG VUE_APP_SEARCH_API_JAVA
ENV VUE_APP_SEARCH_API_JAVA $VUE_APP_SEARCH_API_JAVA
ARG VUE_APP_SEARCH_API_NODE
ENV VUE_APP_SEARCH_API_NODE $VUE_APP_SEARCH_API_NODE
ARG VUE_APP_SEARCH_API_PYTHON
ENV VUE_APP_SEARCH_API_PYTHON $VUE_APP_SEARCH_API_PYTHON

# install project dependencies
RUN npm install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

# build app for production with minification
RUN npm run build

EXPOSE 8084
CMD [ "http-server", "dist", "--port", "8084" ]

