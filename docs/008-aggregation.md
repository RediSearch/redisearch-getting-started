# Aggregation

A common need for application, in addition to retrieving information as a document list, like you have done with the "`FT.SEARCH`" command, is to do some "aggregation".

For example if we look at the movie documents, you may want to retrieve the number of movies group by release year starting with the most recents ones.

For this, RediSearch is providing the FT.AGGREGATE command, the aggregation are describe as data processing pipeline.

Let's now take some examples.

## Sample Aggregations

<details> 
  <summary>
  <i><b>
  Number of movies by year
  </b></i>
  </summary>

```
> FT.AGGREGATE "idx:movie" "*" GROUPBY 1 @release_year REDUCE COUNT 0 AS nb_of_movies

 1) (integer) 60
 2) 1) "release_year"
    2) "1964"
    3) "nb_of_movies"
    4) "9"
 ...   
 61) 1) "release_year"
    2) "2010"
    3) "nb_of_movies"
    4) "15"
```



---
</details>


<details> 
  <summary>
  <i><b>
  Number of movies by year from the most recent to the oldest
  </b></i>
  </summary>

```
> FT.AGGREGATE "idx:movie" "*" GROUPBY 1 @release_year REDUCE COUNT 0 AS nb_of_movies SORTBY 2 @release_year DESC 

1) (integer) 60
 2) 1) "release_year"
    2) "2019"
    3) "nb_of_movies"
    4) "14"
 ...   
11) 1) "release_year"
    2) "2010"
    3) "nb_of_movies"
    4) "15"
```
---
</details>


----
Next: [Sample Application](009-application-development.md)
