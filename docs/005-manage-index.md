# Manage Index


### Listing and inspecting the indexes

The `FT._LIST` command provides a list of all RediSearch indexes in your database:

```
> FT._LIST
1) "idx:movie"
```

`FT.INFO` provides information about a specific index:

```
> FT.INFO "idx:movie" 
 
 1) "index_name"
 2) "idx:movie"
 ...
 5) "index_definition"
 ...
 7) "fields"
 ...
9) "num_docs"
10) "4" 
...

```


### Updating your Indexing

As you build your application and add more information to the database you may need to add new fields to the index. The `FT.ALTER` command enables you to do this.

```
> FT.ALTER idx:movie SCHEMA ADD plot TEXT WEIGHT 0.5
"OK"
```

The `WEIGHT` declares the importance of this field when calculating result accuracy. This is a multiplication factor (default is 1); so in this example the plot is less important than the title.

Let's do a query with the new indexed field:

```
> FT.SEARCH idx:movie "empire @genre:{Action}" RETURN 2 title plot

```


### Dropping the Index


You can drop an index using the `FT.DROPINDEX` command.

```
> FT.DROPINDEX idx:movie

"OK"
```

Dropping an index does not impact the indexed hashes, this means that the movies are still inside the database.

```
>SCAN 0 MATCH movie:*

1) "0"
2) 1) "movie:11002"
   2) "movie:11004"
   3) "movie:11003"
   4) "movie:11005"
```


*Note: You can delete the indexed document/hashes by adding the `DD` parameter.*


---
Next: [Import Sample Dataset](006-import-dataset.md)
