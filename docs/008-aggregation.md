# Aggregation

A common need for applications, in addition to retrieving information as a document list, like you have done with the "`FT.SEARCH`" command, is to do some "aggregation".

For example if we look at the movie documents, you may want to retrieve the number of movies grouped by release year starting with the most recent ones.

For this, RediSearch provides the FT.AGGREGATE command, with aggregations described as a data processing pipeline.

Let's check out some examples.

## Group By & Sort By

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


<details> 
  <summary>
  <i><b>
  Count the number of females by country sorted from the biggest to smallest number.
  </b></i>
  </summary>

```
> FT.AGGREGATE idx:user "@gender:{female}" GROUPBY 1 @country REDUCE COUNT 0 AS nb_of_users SORTBY 2 @nb_of_users DESC

 1) (integer) 193
 2) 1) "country"
    2) "china"
    3) "nb_of_users"
    4) "537"
...
11) 1) "country"
    2) "ukraine"
    3) "nb_of_users"
    4) "72"
```

---
</details>


## Apply Functions


<details> 
  <summary>
  <i><b>
  Number of logins per year and month
  </b></i>
  </summary>

The `idx:user` index contains the last_login field. This field stores the last login time as an EPOC timestamp.

RediSearch aggregation allows you to apply transformations to each record. This is done using the [APPLY](https://oss.redislabs.com/redisearch/Aggregations/#apply_expressions) parameter.

For this example you have to use a [date/time](https://oss.redislabs.com/redisearch/Aggregations/#list_of_datetime_apply_functions) function to extract the month and year from the timestamp.

```
> FT.AGGREGATE idx:user * APPLY year(@last_login) AS year APPLY "monthofyear(@last_login) + 1" AS month GROUPBY 2 @year @month REDUCE count 0 AS num_login SORTBY 4 @year ASC @month ASC

 1) (integer) 13
 2) 1) "year"
    2) "2019"
    3) "month"
    4) "9"
    5) "num_login"
    6) "230"
...
14) 1) "year"
    2) "2020"
    3) "month"
    4) "9"
    5) "num_login"
    6) "271"

```

---
</details>

<details> 
  <summary>
  <i><b>
  Number of logins per weekday
  </b></i>
  </summary>

Using the date/time Apply functions it is possible to extract the day of the week from the timestamp, so let's see how the logins are distributed over the week.

```
> FT.AGGREGATE idx:user * APPLY "dayofweek(@last_login) +1" AS dayofweek GROUPBY 1 @dayofweek REDUCE count 0 AS num_login SORTBY 2 @dayofweek ASC

1) (integer) 7
2) 1) "dayofweek"
   2) "1"
   3) "num_login"
   4) "815"
...
8) 1) "dayofweek"
   2) "7"
   3) "num_login"
   4) "906"

```

---
</details>

## Filter

In the previous example you used the `query string` parameter to select all documents (`"*"`) or a subset of the documents (`"@gender:{female}"`)

It is also possible to filter the results using a predicate expression relating to values in each result. This is applied post-query and relates to the current state of the pipeline. This is done using the [FILTER](https://oss.redislabs.com/redisearch/Aggregations/#filter_expressions) parameter. 


<details> 
  <summary>
  <i><b>
  Count the number of females by country, except China, with more than 100 users, and sorted from the biggest to lowest number
  </b></i>
  </summary>

```
> FT.AGGREGATE idx:user "@gender:{female}" GROUPBY 1 @country  REDUCE COUNT 0 AS nb_of_users  FILTER "@country!='china' && @nb_of_users > 100" SORTBY 2 @nb_of_users DESC

1) (integer) 163
2) 1) "country"
   2) "indonesia"
   3) "nb_of_users"
   4) "309"
...
6) 1) "country"
   2) "brazil"
   3) "nb_of_users"
   4) "108"
```

---
</details>


<details> 
  <summary>
  <i><b>
  Number of login per month, for year 2020
  </b></i>
  </summary>

This is similar to the previous query with the addition of a filter on the year.

```
> FT.AGGREGATE idx:user * APPLY year(@last_login) AS year APPLY "monthofyear(@last_login) + 1" AS month GROUPBY 2 @year @month REDUCE count 0 AS num_login  FILTER "@year==2020" SORTBY 2 @month ASC

 1) (integer) 13
 2) 1) "year"
    2) "2020"
    3) "month"
    4) "1"
    5) "num_login"
    6) "520"
...
10) 1) "year"
    2) "2020"
    3) "month"
    4) "9"
    5) "num_login"
    6) "271"

```

---
</details>


----
Next: [Advanced Options](009-advanced-features.md)
