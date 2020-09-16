# Sample Dataset

In the previous steps you used only few movies, let's now import more movies and some theaters (to discover the geospatial capabilities)

## Dataset Description

**Movies**

The file `sample-app/redisearch-docker/dataset/import_actors.redis` is a script that create 922 Hashes.

The movie hashes contain the following fields.

* **`movie:id`** : The unique ID of the movie, internal to this database (used as the key of the hash)
* **`title`** : The title of the movie.
* **`plot`** : A summary of the movie.
* **`genre`** : The genre of the movie, for now a movie will only h ave one single genre.
* **`release_year`** : The year the movie has been released as a numerical value.
* **`rating`** : The ratings from the public numerical value.
* **`votes`** : Number of votes.
* **`poster`** : Link to the movie poster.
* **`imdb_id`** : id of the movie in the [IMDB](https://imdb.com) database.

<details> 
  <summary>Sample Data: <b>movie:343</b></summary>
  <table>
      <thead>
        <tr>
            <th>Field</th>
            <th>Value</th>
        </tr>
    </thead>
  <tbody>
    <tr>
        <th>title</th>
        <td style='font-family:monospace; font-size: 0.875em; "'>
        Spider-Man
        </td>
    </tr>
    <tr>
        <th>plot</th>
        <td style='font-family:monospace; font-size: 0.875em; "'>
        When bitten by a genetically modified spider a nerdy shy and awkward high school student gains spider-like abilities that he eventually must use to fight evil as a superhero after tragedy befalls his family.
        </td>
    </tr>
    <tr>
        <th>genre</th>
        <td style='font-family:monospace; font-size: 0.875em; "'>
        Action
        </td>
    </tr>
    <tr>
        <th>release_year</th>
        <td style='font-family:monospace; font-size: 0.875em; "'>
        2002
        </td>
    </tr>
    <tr>
        <th>rating</th>
        <td style='font-family:monospace; font-size: 0.875em; "'>
        7.3
        </td>
    </tr>
    <tr>
        <th>votes</th>
        <td style='font-family:monospace; font-size: 0.875em; "'>
        662219
        </td>
    </tr>
    <tr>
        <th>poster</th>
        <td style='font-family:monospace; font-size: 0.875em; "'>
        https://m.media-amazon.com/images/M/MV5BZDEyN2NhMjgtMjdhNi00MmNlLWE5YTgtZGE4MzNjMTRlMGEwXkEyXkFqcGdeQXVyNDUyOTg3Njg@._V1_SX300.jpg
        </td>
    </tr>
    <tr>
        <th>imdb_id</th>
        <td style='font-family:monospace; font-size: 0.875em; "'>
        tt0145487
        </td>
    </tr>
    <tbody>
  </table>
</details>

**Theaters**

The file `sample-app/redisearch-docker/dataset/import_theaters.redis` is a script that create 117 Hashes (used for Geospatial queries). *This dataset is a list of New York Theaters, and not movie theaters, but it is not that critical for this project ;).*

The theater hashes contain the following fields.

* **`theater:id`** : The unique ID of the theater, internal to this database (used as the key of the hash)
* **`name`** : The name of the theater
* **`address`** : The street address
* **`city`** : The city, in this sample dataset all the theaters are in New York
* **`zip`** : The zip code
* **`phone`** : The phone number
* **`url`** : The URL of the theater
* **`location`** : Contains the `longitude,latitude` used to create the Geo-indexed field


<details> 
 <summary>Sample Data: <b>theater:20</b></summary>
  <table>
      <thead>
        <tr>
            <th>Field</th>
            <th>Value</th>
        </tr>
    </thead>
  <tbody>
    <tr>
        <th>name</th>
        <td style='font-family:monospace; font-size: 0.875em; "'>
        Broadway Theatre
        </td>
    </tr>
    <tr>
        <th>address</th>
        <td style='font-family:monospace; font-size: 0.875em; "'>
        1681 Broadway
        </td>
    </tr>
    <tr>
        <th>city</th>
        <td style='font-family:monospace; font-size: 0.875em; "'>
        New York
        </td>
    </tr>
    <tr>
        <th>zip</th>
        <td style='font-family:monospace; font-size: 0.875em; "'>
        10019
        </td>
    </tr>
    <tr>
        <th>phone</th>
        <td style='font-family:monospace; font-size: 0.875em; "'>
        212 944-3700
        </td>
    </tr>
    <tr>
        <th>url</th>
        <td style='font-family:monospace; font-size: 0.875em; "'>
        http://www.shubertorganization.com/theatres/broadway.asp
        </td>
    </tr>
    <tr>
        <th>location</th>
        <td style='font-family:monospace; font-size: 0.875em; "'>
        -73.98335054631019,40.763270202723625
        </td>
    </tr>
    <tbody>
  </table>
</details>

## Importing the Movies & Theaters

Before importing the data, flush the database:

```
> FLUSHALL
```


The easiest way to import the file is to use the `redis-cli`, using the following terminal command:

```
$ redis-cli -h localhost -p 6379 < ./sample-app/redisearch-docker/dataset/import_movies.redis

$ redis-cli -h localhost -p 6379 < ./sample-app/redisearch-docker/dataset/import_theaters.redis

```


Using Redis Insight or the redis-cli you can look at the dataset:

```
> HMGET "movie:343" title release_year genre

1) "Spider-Man"
2) "2002"
3) "Action"


>  HMGET "theater:20" name location
1) "Broadway Theatre"
2) "-73.98335054631019,40.763270202723625"
```

You can also use the `DBSIZE` command to see how many keys you have in your database.

The script create 922 movies and 117 theathers, and not the RediSearch index, this will be done in the next step.

---
Next: [Querying the movie database](007-query-movies.md)