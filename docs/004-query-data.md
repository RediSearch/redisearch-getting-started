# Query Data

The database contains a few movies, and an index, it is now possible to execute some queries.

## Queries

**Example : *All the movies that contains the string "`war`"***

```
> FT.SEARCH idx:movie "war"

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

The FT.SEARCH commands returns a list of results starting with the number of results, then the list of elements (keys & fields).

As you can see the movie *Star Wars: Episode V - The Empire Strikes Back* is found, even though you used only the word “war” to match “Wars” in the title. This is because the title has been indexed as text, so the field is [tokenized](https://oss.redislabs.com/redisearch/Escaping/) and [stemmed](https://oss.redislabs.com/redisearch/Stemming/).

Later when looking at the query syntax in more detail you will learn more about the search capabilities.

It is also possible to limit the list of fields returned by the query using the `RETURN` parameter, let's run the same query, and return only the title and release_year:

```
> FT.SEARCH idx:movie "war" RETURN 2 title release_year

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

This query does not specify any "field" and still returns some movies, this is because RediSearch will search all TEXT fields by default. In the current index only the title is present as a TEXT field. You will see later how to update an index, to add more fields to it.

If you need to perform a query on a specific field you can specify it using the `@field:` syntax, for example:

```
> FT.SEARCH idx:movie "@title:war" RETURN 2 title release_year
```

---
**Example : *All the movies that contains the string "`war` but NOT the `jedi` one"***

Adding the string `-jedi` (minus) will ask the query engine not to return values that contain `jedi`.

```
> FT.SEARCH idx:movie "war -jedi" RETURN 2 title release_year

1) (integer) 1
2) "movie:11002"
3) 1) "title"
   2) "Star Wars: Episode V - The Empire Strikes Back"
   3) "release_year"
   4) "1980"
```

---
**Example : *All the movies that contains the string "`gdfather` using fuzzy search"***

As you can see the word godfather contains a speelling error, it can however be matched using [fuzzy matching](https://oss.redislabs.com/redisearch/Query_Syntax/#fuzzy_matching). Fuzzy matches are performed based on [Levenshtein distance](https://en.wikipedia.org/wiki/Levenshtein_distance) (LD).

```
> FT.SEARCH idx:movie " %gdfather% " RETURN 2 title release_year

1) (integer) 1
2) "movie:11003"
3) 1) "title"
   2) "The Godfather"
   3) "release_year"
   4) "1972"
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

You can find more information about the Tag filters in [the documentation](https://redis.io/docs/stack/search/reference/query_syntax/#tag-filters).

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
```

```
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

1. Created few movies, as Redis hashes (*that we call document*) with the following key pattern `movie:*`
2. Created an index using the `FT.CREATE` command
3. Queried the data using `FT.SEARCH`

When creating the index, using the `idx:movie ON hash PREFIX 1 "movie:"` parameter you are asking the indexing engine to look at all existing keys and index them.

Also new information that matches this pattern/type, will be indexed.

Let's count the number of movies, add a new one, and count again:

```
> FT.SEARCH idx:movie "*" LIMIT 0 0

1) (integer) 4


> HSET movie:11033 title "Tomorrow Never Dies" plot "James Bond sets out to stop a media mogul's plan to induce war between China and the U.K in order to obtain exclusive global media coverage." release_year 1997 genre "Action" rating 6.5 votes 177732 imdb_id tt0120347

> FT.SEARCH idx:movie "*" LIMIT 0 0

1) (integer) 5

```

The new movie has been indexed. You can also search on any of the indexed fields:

```
> FT.SEARCH idx:movie "never" RETURN 2 title release_year

1) (integer) 1
2) "movie:11033"
3) 1) "title"
   2) "Tomorrow Never Dies"
   3) "release_year"
   4) "1997"
```

Now you **update** one of the field, and search for `007`

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

When you *delete* the hash, the index is also updated, and the same happens when the key expires (TTL-Time To Live). 

For example, set the James Bond movie to expire in 20 seconds time:

```
> EXPIRE "movie:11033" 20

```

You can run the following query, and you will that the document expires after 20 seconds and the search query will not return any results, showing that the index has been updated.

```
> FT.SEARCH idx:movie "007" RETURN 2 title release_year

1) (integer)

```

> Note: When you are using Redis as your primary database you are not necessarily using TTLs to delete records. However, if the data you are storing and indexing are transient, for example a caching layer at the top of another datastore or Web service, query user sessions content, ... This is often qualified as a "[Ephemeral Search](https://redislabs.com/blog/the-case-for-ephemeral-search/)" use case: lightweight, fast and expiration.

---
##  More
You have many additional features regarding indexing and searching that you can find in the documentation:

* [FT.SEARCH command](https://redis.io/commands/ft.search)
* [Query Syntax](https://redis.io/docs/stack/search/reference/query_syntax/)


Let's see how to inspect, modify and drop an index.

---
Next: [Manage Indexes](005-manage-index.md)
