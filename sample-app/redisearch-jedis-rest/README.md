# RediSearch REST Server: Java with Jedis

The goal of this application is to show how to develop a RediSearch application with Java.

This project is a Spring Boot application.

This application uses [JRediSearch](https://github.com/RediSearch/JRediSearch) that is based on [Jedis](https://github.com/xetorthio/jedis).

This application exposes various endpoint that are directly consumable in a front end.



### Running the application in Docker

You can run build and run the application from docker using the following commands:

**Build**

```shell script

> docker build -t redis/search-backend-java  .

```

This command will create a new image and build the maven project into it.

**Run**

```shell script
> docker run --rm  \
     --env "REDIS_URL=redis://redis-stack:6379" \
     --env "REDIS_INDEX=idx:movie" \
     --name "redisearch-backend-java"\
     -p 8085:8085 redis/redis-stack:latest
```

You can now access the REST Search service using the following URL:

* http://localhost:8085/api/1.0/movies/search?q=man&limit=10&offset=20

