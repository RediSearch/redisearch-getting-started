# Sample Dataset

In the previous steps you used only a few movies, let's now import:

* More movies *to discover more queries*.
* Theaters *to discover the geospatial capabilities*.
* Users *to do some aggregations*.

## Dataset Description

**Movies**

The file `sample-app/redisearch-docker/dataset/import_movies.redis` is a script that creates 922 Hashes.

The movie hashes contain the following fields.

* **`movie:id`** : The unique ID of the movie, internal to this database (used as the key of the hash)
* **`title`** : The title of the movie.
* **`plot`** : A summary of the movie.
* **`genre`** : The genre of the movie, for now a movie will only have a single genre.
* **`release_year`** : The year the movie was released as a numerical value.
* **`rating`** : A numeric value representing the public's rating for this movie.
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

The file `sample-app/redisearch-docker/dataset/import_theaters.redis` is a script that creates 117 Hashes (used for Geospatial queries). *This dataset is a list of New York Theaters, and not movie theaters, but it is not that critical for this project ;).*

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


**Users**

The file `sample-app/redisearch-docker/dataset/import_users.redis` is a script that creates 5996 Hashes.

The user hashes contain the following fields.

* **`user:id`** : The unique ID of the user.
* **`first_name`** : The first name of the user.
* **`last_name`** : The last name of the user.
* **`email`** : The email of the user.
* **`gender`** : The gender of the user (`female`/`male`).
* **`country`** : The country name of the user.
* **`country_code`** : The country code of the user.
* **`city`** : The city of the user.
* **`longitude`** : The longitude of the user.
* **`latitude`** : The latitude of the user.
* **`last_login`** : The last login time for the user, as EPOC time.
* **`ip_address`** : The IP address of the user.

<details> 
 <summary>Sample Data: <b>user:3233</b></summary>
  <table>
      <thead>
        <tr>
            <th>Field</th>
            <th>Value</th>
        </tr>
    </thead>
  <tbody>
    <tr>
        <th>first_name</th>
        <td style='font-family:monospace; font-size: 0.875em; "'>
        Rosetta
        </td>
    </tr>
    <tr>
        <th>last_name</th>
        <td style='font-family:monospace; font-size: 0.875em; "'>
        Olyff
        </td>
    </tr>
    <tr>
        <th>email</th>
        <td style='font-family:monospace; font-size: 0.875em; "'>
        rolyff6g@163.com
        </td>
    </tr>
    <tr>
        <th>gender</th>
        <td style='font-family:monospace; font-size: 0.875em; "'>
        female
        </td>
    </tr>
    <tr>
        <th>country</th>
        <td style='font-family:monospace; font-size: 0.875em; "'>
        China
        </td>
    </tr>
    <tr>
        <th>country_code</th>
        <td style='font-family:monospace; font-size: 0.875em; "'>
        CN
        </td>
    </tr>
    <tr>
        <th>city</th>
        <td style='font-family:monospace; font-size: 0.875em; "'>
        Huangdao
        </td>
    </tr>
    <tr>
        <th>longitude</th>
        <td style='font-family:monospace; font-size: 0.875em; "'>
        120.04619
        </td>
    </tr>
    <tr>
        <th>latitude</th>
        <td style='font-family:monospace; font-size: 0.875em; "'>
        35.872664
        </td>
    </tr>
    <tr>
        <th>last_login</th>
        <td style='font-family:monospace; font-size: 0.875em; "'>
        1570386621
        </td>
    </tr>
    <tr>
        <th>ip_address</th>
        <td style='font-family:monospace; font-size: 0.875em; "'>
        218.47.90.79
        </td>
    </tr>
    <tbody>
  </table>
</details>


---

## Importing the Movies, Theaters and Users

Before importing the data, flush the database:

```
> FLUSHALL
```


The easiest way to import the file is to use the `redis-cli`, using the following terminal command:

```
$ redis-cli -h localhost -p 6379 < ./sample-app/redisearch-docker/dataset/import_movies.redis

$ redis-cli -h localhost -p 6379 < ./sample-app/redisearch-docker/dataset/import_theaters.redis


$ redis-cli -h localhost -p 6379 < ./sample-app/redisearch-docker/dataset/import_users.redis

```


Using Redis Insight or the `redis-cli` you can look at the dataset:

```
> HMGET "movie:343" title release_year genre

1) "Spider-Man"
2) "2002"
3) "Action"


>  HMGET "theater:20" name location
1) "Broadway Theatre"
2) "-73.98335054631019,40.763270202723625"



> HMGET "user:343" first_name last_name last_login
1) "Umeko"
2) "Castagno"
3) "1574769122"

```

You can also use the `DBSIZE` command to see how many keys you have in your database.

---

## Create Indexes


**Create the `idx:movie` index:**

```
> FT.CREATE idx:movie ON hash PREFIX 1 "movie:" SCHEMA title TEXT SORTABLE plot TEXT WEIGHT 0.5 release_year NUMERIC SORTABLE rating NUMERIC SORTABLE votes NUMERIC SORTABLE genre TAG SORTABLE

"OK"
```

The movies have now been indexed, you can run the `FT.INFO "idx:movie"` command and look at the `num_docs` returned value. (should be 922).

**Create the `idx:theater` index:**

This index will mostly be used to show the geospatial capabilties of RediSearch.

In the previous examples we have created indexes with 3 types:

* `Text`
* `Numeric`
* `Tag`

You will now discover a new type of field: `Geo`.

The `theater` hashes contains a field `location` with the longitude and latitude, that will be used in the index as follows:

```
> FT.CREATE idx:theater ON hash PREFIX 1 "theater:" SCHEMA name TEXT SORTABLE location GEO

"OK"
```

The theaters have been indexed, you can run the `FT.INFO "idx:theater"` command and look at the `num_docs` returned value. (should be 117).


**Create the `idx:user` index:**


```
> FT.CREATE idx:user ON hash PREFIX 1 "user:" SCHEMA gender TAG country TAG SORTABLE last_login NUMERIC SORTABLE location GEO

"OK"
```


---
Next: [Querying the movie database](007-query-movies.md)
