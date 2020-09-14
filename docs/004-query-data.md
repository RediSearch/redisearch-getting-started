# Query Data

The database contains few movies, and an index, it is not possible to execute some queries.

## Queries

**Example : *All the movies that contains the string "`star`"***

```
> FT.SEARCH idx:movie "star"

1) (integer) 2
2) "movie:11005"
3)  1) "title"
    2) "Star Wars: Episode VI - Return of the Jedi"
    ...
   14) "tt0086190"
4) "movie:11002"
5)  1) "title"
    2) "Star Wars: Episode V - The Empire Strikes Back"
    ...
   13) "imdb_id"
   14) "tt0080684"

```

The FT.SEARCH commands returns the list of result starting with the number of results, then the list of elements (keys & fields).

This example uses a simple query string `"star"`, this will return all the movies that *contain* the word star in a text field of the index.

Later when looking in more details on the query syntax you will learn more the search capabilities.

It is also possible to limit the list of fields returned by the query using the `RETURN` parameter, let's run the same query, and return only the title and release_year:

```
> FT.SEARCH idx:movie "star" RETURN 2 title release_year

1) (integer) 2
2) "movie:11005"
3) 1) "title"
   2) "Star Wars: Episode VI - Return of the Jedi"
   3) "release_year"
   4) "1983"
4) "movie:11002"
5) 1) "title"
   2) "Star Wars: Episode V - The Empire Strikes Back"
   3) "release_year"
   4) "1980"
```

This query does not specific any "field" and still return some movie, this is because RediSearch will search by default in all TEXT fields. In the current index only the title is present as a TEXT field. You will see later how to update an index, to add more fields to it.

If you need to do a query on a specific field you can specify it using the `@field:` syntax, for example:

```
> FT.SEARCH idx:movie "@title:star" RETURN 2 title release_year
```


---
**Example : *All the movies that contains the string "`star` but NOT the `jedi` one"***

Adding the string `-jedi` (minus) will ask the query engine to not return the values that contain `jedi`.

```
> FT.SEARCH idx:movie "star -jedi" RETURN 2 title release_year

1) (integer) 1
2) "movie:11002"
3) 1) "title"
   2) "Star Wars: Episode V - The Empire Strikes Back"
   3) "release_year"
   4) "1980"
```


---
**Example  : *All `Thriller` movies"***

The `genre` fields is indexed as a TAG and allows exact match queries.

The syntax to query a TAG field is  @field_name:{value}

```
> FT.SEARCH idx:movie "@genre:{Thriller}" RETURN 2 title release_year

1) (integer) 1
2) "movie:11004"
3) 1) "title"
   2) "Heat"
   3) "release_year"
   4) "1995"

```


---
**Example : *All `Thriller` or `Action` movies"***

```
> FT.SEARCH idx:movie "@genre:{Thriller|Action}" RETURN 2 title release_year

1) (integer) 3
2) "movie:11004"
3) 1) "title"
   2) "Heat"
   3) "release_year"
   4) "1995"
4) "movie:11005"
5) 1) "title"
   2) "Star Wars: Episode VI - Return of the Jedi"
   3) "release_year"
   4) "1983"
6) "movie:11002"
7) 1) "title"
   2) "Star Wars: Episode V - The Empire Strikes Back"
   3) "release_year"
   4) "1980"
```

You can find more information about the Tag filters in [the documentation](https://oss.redislabs.com/redisearch/master/Query_Syntax/#tag_filters).

---
**Example : *All `Thriller` or `Action` movies that does not have `Jedi` in the title"***

```
> FT.SEARCH idx:movie "@genre:{Thriller|Action} @title:-jedi" RETURN 2 title release_year

1) (integer) 2
2) "movie:11004"
3) 1) "title"
   2) "Heat"
   3) "release_year"
   4) "1995"
4) "movie:11002"
5) 1) "title"
   2) "Star Wars: Episode V - The Empire Strikes Back"
   3) "release_year"
   4) "1980"
```

---
**Example : *All the movies released between 1970 and 1980 (included)***

The FT.SEARCH syntax has two ways to query numeric fields:

* using the `FILTER` parameter

or 

* using the `@field` in the query string.


```
> FT.SEARCH idx:movie * FILTER release_year 1970 1980 RETURN 2 title release_year

> FT.SEARCH idx:movie "@release_year:[1970 1980]" RETURN 2 title release_year

1) (integer) 2
2) "movie:11003"
3) 1) "title"
   2) "The Godfather"
   3) "release_year"
   4) "1972"
4) "movie:11002"
5) 1) "title"
   2) "Star Wars: Episode V - The Empire Strikes Back"
   3) "release_year"
   4) "1980"

```

To exclude a value prepend it with `(` in the FILTER or query string, for example to exclude 1980:

```
> FT.SEARCH idx:movie "@release_year:[1970 (1980]" RETURN 2 title release_year
```


---
## Insert, Update, Delete and Expire Documents

As part of this tutorial you have:

1. Create few movies, as Redis hashes (*that we call document*) with the following key pattern `movie:*`
2. Create an index using the `FT.CREATE` command
3. Query the data using `FT.SEARCH`

When creating the index, using  the `idx:movie ON hash PREFIX 1 "movie:"` parameter you are asking the indexing engine to look at all existing keys and index them.

Also any new information that match this pattern/type, will be indexed.

Let's count the number of movie and then add a new one, and count again:

```
> FT.SEARCH idx:movie "*" LIMIT 0 0
1) (integer) 4


> HSET movie:11033 title "Tomorrow Never Dies" plot "James Bond sets out to stop a media mogul's plan to induce war between China and the U.K in order to obtain exclusive global media coverage." release_year 1997 genre "Action" rating 6.5 votes 177732 imdb_id tt0120347

> FT.SEARCH idx:movie "*" LIMIT 0 0
1) (integer) 5

```

The new movie has been indexed.

You can also search on any of the indexed fields:

```
> FT.SEARCH idx:movie "never" RETURN 2 title release_year

1) (integer) 1
2) "movie:11033"
3) 1) "title"
   2) "Tomorrow Never Dies"
   3) "release_year"
   4) "1997"
```

Let **update** one of the field, and search for `007`

```
> HSET movie:11033 title "Tomorrow Never Dies - 007"


> FT.SEARCH idx:movie "007" RETURN 2 title release_year

1) (integer) 1
2) "movie:11033"
3) 1) "title"
   2) "Tomorrow Never Dies - 007"
   3) "release_year"
   4) "1997"
```

When you *delete* the has the index is also updated, and the same happends when you are using expiration (TTL-Time To Live). 

For example put a 20 sedonds expiration time to the James Bond movie:

```
> EXPIRE "movie:11033" 20

```

You can run the following query, and you will see after 20 seconds the document is not here and the search query will not return any result, showing that the index has been upddated.

```
> FT.SEARCH idx:movie "007" RETURN 2 title release_year

1) (integer)

```

> Note: When you are using Redis as your primary database you are not necessary using the TTL to delet record. However, if the data your are storing and indexing are transient, for example a caching layer at the top of another datastore or Web service, query user sessions content, ... This is often qualified as a "Ephemeral Search" use case: lighweight, fast and expiration.

---
##  More
You have many additional features regarding indexing and searching that you can find in the documentation:

* [FT.SEARCH command](https://oss.redislabs.com/redisearch/master/Commands/#ftsearch)
* [Query Syntax](https://oss.redislabs.com/redisearch/master/Query_Syntax)


Let's see how to inspect, modify and drop an index.

---
Next: [Manage Indexes](005-manage-index.md)
