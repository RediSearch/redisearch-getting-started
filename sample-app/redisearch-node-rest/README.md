# RediSearch: Node.js Sample Application

## Install Dependencies

This application is built with [Express](https://www.npmjs.com/package/express) and [Node Redis](https://www.npmjs.com/package/redis).  Install these dependencies as follows:

```bash
$ npm install
```

## Application Archictecture

The REST API routes and Express server are defined and configured in `server.js`.  Each route makes calls to an instance of a search service that executes Redis/RediSearch commands and formats the responses into JSON objects.  The code for this is contained in `NodeSearchService.js`.

## Running the application in Docker

You can build and run the application with Docker using the following commands:

### Build

```bash
$ docker build -t redis/search-backend-node . 
```

This command will create a new image and build the Node.js project into it.

### Run

```bash
$ docker run --rm  \
     --env "REDIS_URL=redis://host.docker.internal:6379" \
     --env "REDIS_INDEX=idx:movie" \
     --name "redisearch-backend-node"\
     -p 8086:8086 redis/search-backend-node
```

## Running the Application Locally

To run the application on your local machine:

```bash
$ npm start
```

Use this command to run the application using [nodemon](https://www.npmjs.com/package/nodemon) so that the server is automatically restarted for you if you make code changes:

```bash
$ npm run dev
```

### Accessing the API

You can now access the REST Search service using the following example URLs:

* Movies matching "star" ordered by year of release with most recent first: http://localhost:8086/api/1.0/movies/search?q=star&sortby=release_year&ascending=false
* Details for movie with ID 293 (The Empire Strikes Back): http://localhost:8086/api/1.0/movies/293
* Aggregate query for movies by genre: http://localhost:8086/api/1.0/movies/group_by/genre



