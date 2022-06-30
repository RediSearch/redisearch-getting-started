# Application Development

It is time now to see how to use RediSearch in your application.

You can find the same REST Service that uses RediSearch developed with different programming languages.

* [RediSearch & Java : Jedis/JRediSearch](../../../tree/master/sample-app/redisearch-jedis-rest)

* [Node.js : Node RediSearch](../../../tree/master/sample-app/redisearch-node-rest)

* [Python : Python RediSearch](../../../tree/master/sample-app/redisearch-python-rest)

The frontend is created using a Vue.js application that let you run search queries using each of the REST backend.

![Application Architecture](https://raw.githubusercontent.com/RediSearch/redisearch-getting-started/master/docs/images/sample-app-archi.png)


## Run the Sample Application

The application and all the services, including RediSearch, are available as a Docker Compose application.


If you have not already downloaded the project, clone it:

```
> git clone https://github.com/RediSearch/redisearch-getting-started.git

> cd redisearch-getting-started
```


To run the application:

```
> cd sample-app

> docker-compose up --force-recreate --build

```

This Docker Compose will start:

1. A Redis Stack container on port 6379.  The redis-cli can be used with this container once the ports are exposed
1. The Java, Node and Python REST Services available on port 8085, 8086, 8087
1. The frontend on port 8084
1. A second RediStack container will start on port 6380 just to load the sample data to the redis stack instance running on port 6379.  This container exits once the sample data has been loaded to the 6379 container

Once started you can access the application and its services using the following URLs:

* http://localhost:8084
* http://localhost:8085/api/1.0/movies/search?q=star&offset=0&limit=10
* http://localhost:8086/api/1.0/movies/search?q=star&offset=0&limit=10
* http://localhost:8087/api/1.0/movies/search?q=star&offset=0&limit=10



#### Stop and Delete Everything

Run the following command to delete the containers & images:

```
> docker-compose down -v --rmi local --remove-orphans
```
