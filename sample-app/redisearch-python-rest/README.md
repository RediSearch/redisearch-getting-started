# RediSearch REST Server: Python



### Running the application in Docker

You can run build and run the application from docker using the following commands:

**Build**

```shell script

> docker build -t redis/search-backend-python  .

```

This command will create a new image and build the maven project into it.

**Run**

```shell script
> docker run --rm  \
     --env "REDIS_URL=redis://redis-stack:6379" \
     --env "REDIS_INDEX=idx:movie" \
     --name "redisearch-backend-python"\
     -p 8087:8087 redis/redis-stack:latest
```

You can now access the REST Search service using the following URL:

* http://localhost:8087/api/1.0/movies/search?q=man&limit=10&offset=20

