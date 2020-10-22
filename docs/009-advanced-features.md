# Other Options

## Create an index using a Filter

In the previous examples, the indices were created using a `PREFIX`, where all the keys matching the type and prefix are indexed.

It is also possible to create an index using a filter, for example create an index with all the "Drama" movies released between 1990 and 2000 (2000 not included).

The [`FILTER`](https://oss.redislabs.com/redisearch/Aggregations/#filter_expressions)` expression is using the [aggregation filter syntax(https://oss.redislabs.com/redisearch/Aggregations/#filter_expressions)], for example for the genre and release year it will be

* `FILTER "@genre=='Drama' && @release_year>=1990 && @release_year<2000"`

So when you create the index:

`FT.CREATE idx:drama ON Hash PREFIX 1 "movie:" FILTER "@genre=='Drama' && @release_year>=1990 && @release_year<2000" SCHEMA title TEXT SORTABLE release_year NUMERIC SORTABLE `

You can run the `FT.INFO idx:drama` command to look at the index definitions and statistics.

Notes
* The `PREFIX` is not optional.
* In this appliation this index is not useful since you can get the same data from the `idx:movie`


You can check that the data has been indexed by running the following queries that should return the same number of documents.

On `idx:drama` 

```
> FT.SEARCH idx:drama "  @release_year:[1990 (2000]" LIMIT 0 0

1) (integer) 24
```

On `idx"movie`

```
> FT.SEARCH idx:movie "@genre:{Drama}  @release_year:[1990 (2000]" LIMIT 0 0

1) (integer) 24
```



----
Next: [Sample Application](010-application-development.md)

