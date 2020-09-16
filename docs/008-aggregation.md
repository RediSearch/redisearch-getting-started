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

<details> 
  <summary>
  <i><b>
  Number of movies by genre, with the total number of votes, and average rating
  </b></i>
  </summary>

```
> FT.AGGREGATE idx:movie "*" GROUPBY 1 @genre REDUCE COUNT 0 AS nb_of_movies REDUCE SUM 1 votes AS nb_of_votes REDUCE AVG 1 rating AS avg_rating SORTBY 4 @avg_rating DESC @nb_of_votes DESC


 1) (integer) 26
 2) 1) "genre"
    2) "fantasy"
    3) "nb_of_movies"
    4) "1"
    5) "nb_of_votes"
    6) "1500090"
    7) "avg_rating"
    8) "8.8"
...
11) 1) "genre"
    2) "romance"
    3) "nb_of_movies"
    4) "2"
    5) "nb_of_votes"
    6) "746"
    7) "avg_rating"
    8) "6.65"
```



---
</details>

----
Next: [Advanced Options](009-advanced-features.md)
