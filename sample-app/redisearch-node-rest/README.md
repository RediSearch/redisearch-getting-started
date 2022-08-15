# RediSearch: Node.js Sample




## Coding the application

#### 1- Create the Project

Follow the `npm` steps

```
$ npm init
```

#### 2- Add Dependencies

Add the dependencies:

* [Express](https://www.npmjs.com/package/express)
* [Node RediSearch](https://www.npmjs.com/package/redis-redisearch)

```
$ npm install express redis redis-redisearch --save
```


#### 3- Create REST API Routes

Create the `server.js` file and add the following code

```js
const express = require('express')
const app = express()
const port = 3003


app.get('/api/1.0/', (req, res) => {
    res.json({"status" : "started"});
  })


app.get('/', (req, res) => {
  res.send('RediSearch Node REST Server Started')
})

app.listen(port, () => {
  console.log(`RediSearch Node listening at http://localhost:${port}`)
})

```

This will be the base of the various API endpoints.


#### 4- Create a NodeSearchService

In this sample application all the RediSearch interactions will be done in `NodeSearchService.js` file.


### Running the application in Docker

You can run build and run the application from docker using the following commands:

**Build**

```shell script

> docker build -t redis/search-backend-node  .

```

This command will create a new image and build the Node.js project into it.

**Run**

```shell script
> docker run --rm  \
     --env "REDIS_URL=redis://host.docker.internal:6379" \
     --env "REDIS_INDEX=idx:movie" \
     --name "redisearch-backend-node"\
     -p 8086:8086 redis/redis-stack:latest
```

### Running the application locally

To run the application on your local machine:

```shell script
> npm install
> npm start
```

### Accessing the API

You can now access the REST Search service using the following URL:

* http://localhost:8086/api/1.0/movies/search?q=man&limit=10&offset=20



