# Create Index

Before creating the index let's describe the dataset and insert entries.

## Sample Dataset

In this project you will use a simple dataset describging movies, for now, all record are in English. You will learn more about other languages in another tutorial.

A movie is represented by the following attributes:

* **`movie_id`** : The unique ID of the movie, internal to this database
* **`title`** : The title of the movie.
* **`plot`** : A summary of the movie.
* **`genre`** : The genre of the movie, for now a movie will only h ave one single genre.
* **`release_year`** : The year the movie has been released as a numerical value.
* **`rating`** : The ratings from the public numerical value.
* **`votes`** : Number of votes.
* **`poster`** : Link to the movie poster.
* **`imdb_id`** : id of the movie in the [IMDB](https://imdb.com) database.


### Key and Data structure

As a Redis developer, one of the first thing to look when building your application is to define the structure of the key and data (data design/data modeling).

A common way of defining the keys in Redis is to use specific pattern in them for example in this application when the database will probably deal with various business objects: movies, actors, theaters, users, ... we can use the following pattern:

* `business_object:key`

For example:
* `movie:001` for the movie with the id 001
* `user:001` the user with the id 001


and for the movies information you should use a Rediss [Hashes](https://redis.io/topics/data-types#hashes). 

A Redis Hash will allow the application to structure all the movie attributes in individual field; also RediSearch will index the fields based on the index definition.

## Insert Movies


It is time now to add some data into your database, let's insert few movies, using `redis-cli` or [Redis Insight](https://redislabs.com/redisinsight/).

Once you are connected to your Redis instance run the following commands:

```

> HSET movie:11002 title "Star Wars: Episode V - The Empire Strikes Back" plot "After the Rebels are brutally overpowered by the Empire on the ice planet Hoth, Luke Skywalker begins Jedi training with Yoda, while his friends are pursued by Darth Vader and a bounty hunter named Boba Fett all over the galaxy." release_year 1980 genre "Action" rating 8.7 votes 1127635 imdb_id tt0080684

> HSET movie:11003 title "The Godfather" plot "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son." release_year 1972 genre "Drama" rating 9.2 votes 1563839 imdb_id tt0068646

> HSET movie:11004 title "Heat" plot "A group of professional bank robbers start to feel the heat from police when they unknowingly leave a clue at their latest heist." release_year 1995 genre "Thriller" rating 8.2 votes 559490 imdb_id tt0113277

> HSET "movie:11005" title "Star Wars: Episode VI - Return of the Jedi" genre "Action" votes 906260 rating 8.3 release_year 1983  plot "The Rebels dispatch to Endor to destroy the second Empire's Death Star." ibmdb_id "tt0086190" 

```

Now it is possible to get information from the hash using the movie ID for example if you want to get the title, and rating execute the following command:

```
> HMGET movie:11002 title rating

1) "Star Wars: Episode V - The Empire Strikes Back"
2) "8.7"
```

And you can increment the rating of this movie using:

```
> HINCRBYFLOAT movie:11002 rating 0.1
"8.8"
```

But how do you get a movie or list of movies from the release year, rating value or title?

One option, would be to read all the movies, check all fields and then return the movies; no need to say that it is a really bad idea.

Nevertheless this is where Redis developer are creating custom secondary index using SET/SORTED SET structures that point back to the movie hash. This needs some heavy design and implementation.

This is where RediSearch module is helping, and why it as been created.


## RediSearch & Indexing


RediSearch simplifies a lot this by offering a simple and automatic way to create secondary indices on Redis Hashes. (more datastructure will eventually come)

![Secondary Index](https://github.com/RediSearch/redisearch-getting-started/blob/master/docs/images/secondary-index.png?raw=true)

Using RediSearch if you want to query on a field, you must index the fields. Let's start by indexing the following fields in of our movies:

* Title
* Release Year
* Rating
* Genre

When creating a index you define:

* which data you want to index: all *hashes* with a key starting with `movies` 
* which fields in the hashes you want to index using a Schema definition.

> ***Warning: Do not index all fields***
>
> Indexes take space in memory, and must be updated when the primary data is updated. So create the index carefully and keep the definition up to date with your need.

### Create the Index

Create the index with the following command:

```
> FT.CREATE idx:movie ON hash PREFIX 1 "movie:" SCHEMA title TEXT SORTABLE release_year NUMERIC SORTABLE rating NUMERIC SORTABLE genre TAG SORTABLE
```

Before running some queries let's look at the command in detail:

* [`FT.CREATE`](https://oss.redislabs.com/redisearch/master/Commands/#ftcreate) : creates an index with the given spec. The index name will be used in all the key names so keep it short.
* `idx:movie` : the name of the index
* `ON hash` : the type of structure to be indexed. *Note that in RediSearch 2.0 only hash structure are supported, this is parameter will allow RediSearch to index other structure in the future* 
* `PREFIX 1 "movie:"` : the prefix of the keys that should be indexed. This is a list, so since we want to only index movie:* keys the number is 1. Suppose you want to index movies and tv_show that have the same fields, you can use: `PREFIX 2 "movie:" "tv_show:"` 
* `SCHEMA ...`: define the schema, the fields and their type, to index, as you can see in the command, we are using [TEXT](https://oss.redislabs.com/redisearch/Query_Syntax/#a_few_query_examples), [NUMERIC](https://oss.redislabs.com/redisearch/Query_Syntax/#numeric_filters_in_query) and [TAG](https://oss.redislabs.com/redisearch/Query_Syntax/#tag_filters), and [SORTABLE](https://oss.redislabs.com/redisearch/Sorting/) parameters.

You can find information about the [FT.CREATE](https://oss.redislabs.com/redisearch/Commands/#ftcreate) command in the [documentation](https://oss.redislabs.com/redisearch/Commands/#ftcreate).


You can look at the index information with the following command:

```
> FT.INFO idx:movie
```

---
Next: [Query Data](004-query-data.md)
