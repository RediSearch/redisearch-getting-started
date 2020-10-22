# Querying the Movie Dataset



As described earlier in the tutorial, one of the goals of RediSearch is to provide rich querying capabilities such as:

* simple and complex conditions
* sorting
* pagination
* counting


### Conditions

The best way to start to work with RediSearch query capabilities is to look at the various conditions options.


<details> 
  <summary>
  <i><b>
  Find all the movies that contain the word 'heat' or related to 'heat'
  </b></i>
  </summary>

```
> FT.SEARCH "idx:movie" "heat" RETURN 2 title plot

1) (integer) 4
2) "movie:1141"
3) 1) "title"
   2) "Heat"
   3) "plot"
   4) "A group of professional bank robbers start to feel the heat from police when they unknowingly leave a clue at their latest heist."
4) "movie:818"
5) 1) "title"
   2) "California Heat"
   3) "plot"
   4) "A lifeguard bets he can be true to just one woman."
6) "movie:736"
7) 1) "title"
   2) "Chicago Justice"
   3) "plot"
   4) "The State's Attorney's dedicated team of prosecutors and investigators navigates heated city politics and controversy head-on,while fearlessly pursuing justice."
8) "movie:1109"
9) 1) "title"
   2) "Love & Hip Hop: Miami"
   3) "plot"
   4) "'Love and Hip Hop Miami' turns up the heat and doesn't hold back in making the 305 the place to be. Multi-platinum selling hip-hop legend Trick Daddy is back in the studio collaborating ..."

```

The first line contains the number of documents (`4`) that match the query condition, then the list of movies.

This query is a "fieldless" condition, this means that the query engine has:
* searched in all the TEXT fields of the index(`title` and `plot`)
* for the word `heat` and related words, this is why the movie:736 is returned since it has the word `heated` in the plot ([stemming](https://oss.redislabs.com/redisearch/Stemming/))
* returned the result sorted by score, remember that the title has a weight of 1.0, and the plot a weight of 0.5. So when the word or related words are found in the title the score is larger.
---
</details>



<details> 
  <summary>
  <i><b>
    Find all the movies with a title that contains the word 'heat' or related to 'heat'
  </b></i>
  </summary>

In this case you have to set the criteria to a the field title using the `@title` notation.

```
> FT.SEARCH "idx:movie" "@title:heat" RETURN 2 title plot
1) (integer) 2
2) "movie:1141"
3) 1) "title"
   2) "Heat"
   3) "plot"
   4) "A group of professional bank robbers start to feel the heat from police when they unknowingly leave a clue at their latest heist."
4) "movie:818"
5) 1) "title"
   2) "California Heat"
   3) "plot"
   4) "A lifeguard bets he can be true to just one woman."

```

So only 2 movies are returned.

---
</details>


<details> 
  <summary>
  <i><b>
  Find all the movies where the title contains 'heat' and does NOT contains 'california'
  </b></i>
  </summary>

For this you add parentheses around the field condition and add the `-` sign to 'california'.

```
> FT.SEARCH "idx:movie" "@title:(heat -california)" RETURN 2 title plot
1) (integer) 1
2) "movie:1141"
3) 1) "title"
   2) "Heat"
   3) "plot"
   4) "A group of professional bank robbers start to feel the heat from police when they unknowingly leave a clue at their latest heist."

```

Only one movie is returned.

If you do not put the `( .. )` the `-california` condition will be applied to all the text fields.

You can do test this with the following queries:

```
> FT.SEARCH "idx:movie" "@title:(heat -woman)" RETURN 2 title plot
```

```
> FT.SEARCH "idx:movie" "@title:heat -woman" RETURN 2 title plot
```

As you can see the first query only searches for woman in the title and returns two movies "Heat" and "California Heat", where the second query eliminates "California Heat" from the list since the plot contains the word `woman`.

---
</details>



<details> 
  <summary>
  <i><b>
  Find all the 'Drama' movies that have 'heat' in the title
  </b></i>
  </summary>

As you have seen earlier the movie index contains:
* the `title` and plot as TEXT
* the `genre` as TAG.

You saw earlier how to place a condition on a TEXT field.

The [TAG](https://oss.redislabs.com/redisearch/Tags/) is a little bit different as the index engine does not do any stemming.

To set a condition on this field you must use the `@field:{value}` notation, the `{...}` indicates that it is a TAG condition


```
>  FT.SEARCH "idx:movie" "@title:(heat) @genre:{Drama} " RETURN 3 title plot genre
1) (integer) 1
2) "movie:1141"
3) 1) "title"
   2) "Heat"
   3) "plot"
   4) "A group of professional bank robbers start to feel the heat from police when they unknowingly leave a clue at their latest heist."
   5) "genre"
   6) "Drama"
```

As you can see this query applies conditions to two different fields with an exact match on the TAG.

TAG is the structure to use when you want to do exact matches on strings/words.
---
</details>


<details> 
  <summary>
  <i><b>
  Find all the 'Drama' or 'Comedy' movies that have 'heat' in the title
  </b></i>
  </summary>

This is similar to the previous query, you can pass a list of values with the `|` to represent the OR.


```
> FT.SEARCH "idx:movie" "@title:(heat)  @genre:{Drama|Comedy} " RETURN 3 title plot genre

1) (integer) 2
2) "movie:1141"
3) 1) "title"
   2) "Heat"
   3) "plot"
   4) "A group of professional bank robbers start to feel the heat from police when they unknowingly leave a clue at their latest heist."
   5) "genre"
   6) "Drama"
4) "movie:818"
5) 1) "title"
   2) "California Heat"
   3) "plot"
   4) "A lifeguard bets he can be true to just one woman."
   5) "genre"
   6) "Comedy"
```


You can also put the '|' between all the conditions to search for example all movies that have "heat" in the title, or that are Comedy or that are Drama. The query will look like:

```
FT.SEARCH "idx:movie" "@title:(heat) | @genre:{Drama|Comedy} " RETURN 3 title plot genre
```

---
</details>


<details> 
  <summary>
  <i><b>Find all 'Mystery' OR 'Thriller' movies, released in 2014 OR 2018</b></i>
  </summary>

In this query, the new item is the query on a numeric field (release_year).

Like before, for the condition you have to use the `@field:` notation, but for a numeric field you have to put the interval of the condition.

In this query it will be two conditions with an OR (`|`).

```
> FT.SEARCH "idx:movie" "@genre:{Mystery|Thriller} (@release_year:[2018 2018] | @release_year:[2014 2014] )"   RETURN 3 title release_year genre

1) (integer) 3
2) "movie:461"
3) 1) "title"
   2) "The Boat ()"
   3) "release_year"
   4) "2018"
   5) "genre"
   6) "Mystery"
4) "movie:65"
5) 1) "title"
   2) "The Loft"
   3) "release_year"
   4) "2014"
   5) "genre"
   6) "Mystery"
6) "movie:989"
7) 1) "title"
   2) "Los Angeles Overnight"
   3) "release_year"
   4) "2018"
   5) "genre"
   6) "Thriller"
```


---
</details>

Summary

* Fieldless queries apply to all TEXT fields and use the words and their base form (stemming)
* To apply a condition to a specific field you must use the `@field:` notation
* Multiple conditions are "intersection" (AND condition), to do a "union" (OR condition), you have to use the "`|`" character.

----
### Sort

A very common use case when querying data is to sort the data on a specific field, and paginate over the result.

<details> 
  <summary>
  <i><b>Query all the `Action` movies, sorted by release year from most recent to the oldest</b></i>
  </summary>

```
> FT.SEARCH "idx:movie" "@genre:{Action}"  SORTBY release_year DESC RETURN 2 title release_year
 1) (integer) 186
 2) "movie:360"
 3) 1) "release_year"
    2) "2019"
    3) "title"
    4) "Spider-Man: Far from Home"
 ...
20) "movie:278"
21) 1) "release_year"
    2) "2016"
    3) "title"
    4) "Mechanic: Resurrection"
```

The first line contains the number of documents (`186`) that match the query condition.

The FT.SEARCH command, by default, returns the first ten documents. You will see in the next query how to paginate.

You can only use one SORTBY clause in an FT.SEARCH query, if you want to sort on multiple fields, for example sorting movies by `genre` ascending and `release_year` descending, you have to use an FT.AGGREGATE, this is covered in the [next section](008-aggregation.md).

Note: The field used in the [SORTBY](https://oss.redislabs.com/redisearch/Sorting/#specifying_sortby) should be part of the index schema and defined as SORTABLE.
---
</details>

----
### Paginate

<details> 
  <summary>
  <i><b>Query all the `Action` movies, sorted by release year from the oldest to the most recent one, returning the record by batch of 100 movies</b></i>
  </summary>

```
> FT.SEARCH "idx:movie" "@genre:{Action}" LIMIT 0 100  SORTBY release_year ASC RETURN 2 title release_year
  1) (integer) 186
  2) "movie:892"
  3) 1) "release_year"
     2) "1966"
     3) "title"
     4) "Texas,Adios"
...  
200) "movie:12"
201) 1) "release_year"
     2) "2014"
     3) "title"
     4) "Fury"
```

The result is very similar to the previous query:
* 186 documents found
* the first document is the oldest one, released in 1966
* the latest movie of the batch was released in 2014


To paginate to the next batch you need to change the limit as follows:

```
> FT.SEARCH "idx:movie" "@genre:{Action}" LIMIT 100 200  SORTBY release_year ASC RETURN 2 title release_year
```
---
</details>


----
### Count


<details> 
  <summary>
  <i><b>Count the number of 'Action' movies</b></i>
  </summary>

  Based on the sample queries that you have seen earlier, if you specify `LIMIT 0 0` it will give you the number of documents based on the query condition.

```
> FT.SEARCH "idx:movie" "@genre:{Action}" LIMIT 0 0

1) (integer) 186
```
---
</details>


<details> 
  <summary>
  <i><b>Count the number of 'Action' movies released in 2017 </b></i>
  </summary>

  Based on the sample queries that you have seen earlier, if you specify `LIMIT 0 0` it will give you the number of documents based on the query condition.

```
> FT.SEARCH "idx:movie" "@genre:{Action}" FILTER release_year 2017 2017 LIMIT 0 0

1) (integer) 5
```

You can also use the following syntax:

```
> FT.SEARCH "idx:movie" "@genre:{Action} @release_year:[2017 2017]" LIMIT 0 0

1) (integer) 5
```

---
</details>


----
### Geospatial Queries

<details> 
  <summary>
  <i><b>Find theaters, name and address, that are at less than 400 meters from MOMA</b></i>
  </summary>

Suppose you are at the MOMA, located at "11 W 53rd St, New York", and you want to find all the theaters located in a 400m radius.

For this you need to determine the lat/long position of your current location `-73.9798156,40.7614367`, and execute the following query:

```
> FT.SEARCH "idx:theater" "@location:[-73.9798156 40.7614367 400 m]" RETURN 2 name address

1) (integer) 5
 2) "theater:30"
 3) 1) "name"
    2) "Ed Sullivan Theater"
    3) "address"
    4) "1697 Broadway"
...
10) "theater:115"
11) 1) "name"
    2) "Winter Garden Theatre"
    3) "address"
    4) "1634 Broadway"
```

---
</details>



----
Next: [Aggregation](008-aggregation.md)
