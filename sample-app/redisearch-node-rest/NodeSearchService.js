import { createClient, AggregateSteps } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const indexNameMovies = process.env.REDIS_INDEX || 'idx:movie';
const indexNameComments = process.env.REDIS_INDEX_COMMENTS || 'idx:comments:movies';

console.log(`Configuration Index: ${indexNameMovies} - redisUrl: ${redisUrl}`);

const client = createClient(redisUrl);
await client.connect();

const SearchService = function () {
  const _search = async function (queryString, options) {
    console.log(options);

    const searchOptions = {
      WITHSCORES: true, // Node Redis 4 does not yet support WITHSCORES in FT.SEARCH.
      LIMIT: {
        from: options.offset || 0,
        size: options.limit || 10
      }
    };

    if (options.sortBy) {
      searchOptions.SORTBY = {
        BY: options.sortBy,
        DIRECTION: options.ascending ? 'ASC' : 'DESC'
      };
    }

    console.log(searchOptions);

    const searchResults = await client.ft.search(indexNameMovies, queryString, searchOptions);
    console.log(searchResults);

    const docs = [];
    for (const searchResult of searchResults.documents) {
      docs.push({
        meta: {
          id: searchResult.id,
          score: 'TODO' // Node Redis 4 does not yet support WITHSCORES in FT.SEARCH
        },
        fields: searchResult.value
      });
    }

    return {
      meta: {
        totalResults: searchResults.total,
        offset: searchOptions.LIMIT.from,
        limit: searchOptions.LIMIT.size,
        queryString
      },
      docs,
      raw_docs: searchResults.documents
    };
  }

  const _getMovieGroupBy = async function (field) {
    const retValue = {
      totalResults: 0,
      rows: [],
      raw: [] // Used to return the raw response from Node Redis.
    };

    // TODO Remove this...
    const pipeline = [
      indexNameMovies,      // name of the index
      '*',            // query string,
      'GROUPBY', '1', `@${field}`, // group by
      'REDUCE', 'COUNT', '0', 'AS', 'nb_of_movies', //count the number of movies by group
      'SORTBY', '2', `@${field}`, 'ASC', // sorted by the genre
      'LIMIT', '0', '1000'  // get all genre expecting less than 100 genres
    ];

    const aggrResult = await client.ft.aggregate(indexNameMovies, '*', {
      STEPS: [
        {
          type: AggregateSteps.GROUPBY,
          properties: field,
          REDUCE: [
            { 
              type: 'COUNT',
              AS: 'nb_of_movies'
            }
          ]
        },
        {
          type: AggregateSteps.SORTBY,
          BY: field,
          DIRECTION: 'ASC' // TODO This is not being passed to the FT.AGGREGATE command right now?
        },
        {
          type: AggregateSteps.LIMIT,
          from: 0,
          size: 1000
        }
      ]
    });

    console.log(aggrResult);
    // TODO transformations...

    // client.ft_aggregate(
    //   pipeline,
    //   function (err, aggrResult) {

    //     // transform array into document
    //     // this should be added to a generic function
    //     // ideally into the library itself
    //     retValue.totalResults = aggrResult[0];

    //     // loop on the results starting at element 1
    //     for (let i = 1; i <= aggrResult.length - 1; i++) {
    //       const item = aggrResult[i];
    //       const doc = {};
    //       for (let j = 0, len = item.length; j < len; j++) {
    //         doc[item[j]] = item[j + 1];
    //         doc[item[j + 2]] = item[j + 3];
    //         j = j + 3;
    //       }
    //       retValue.rows.push(doc);
    //     }
    //     retValue.raw = aggrResult;
    //     callback(err, retValue);
    //   });
  }

  const _getMovie = async function (id) {
    // If id does not start with `movie:` add it.
    if (!id.startsWith('movie:')) {
      id = `movie:${id}`;
    }

    const movie = await client.hGetAll(id);

    return movie.ibmdb_id ? movie : {
      ibmdb_id: null,
      genre: null,
      poster: null,
      rating: null,
      votes: null,
      title: null,
      plot: null,
      release_year: null
    };
  }

  /**
   * Update a movie.
   */
  const _saveMovie = async function (id, movie) {
    // If id does not start with `movie:` add it.
    if (!id.startsWith('movie:')) {
      id = `movie:${id}`;
    }

    const result = await client.hSet(id, movie);
    return result;
  }

  const _getComments = async function (movieId, options) {
    // Parse the movie id if necessary.
    if (movieId.startsWith('movie:')) {
      movieId = movieId.split(':')[1];
    }

    const queryString = `@movie_id:{${movieId}}`;
    const searchOptions = {
      WITHSCORES: true,  // Node Redis 4 does not yet support WITHSCORES in FT.SEARCH
      LIMIT: {
        from: options.offset || 0,
        size: options.limit || 10
      }
    };

    if (options.sortBy) {
      searchOptions.SORTBY = {
        BY: options.sortBy,
        DIRECTION: options.ascending ? 'ASC' : 'DESC'
      };
    } else {
      searchOptions.SORTBY = {
        BY: 'timestamp',
        DIRECTION: 'DESC'
      }
    }
    
    console.log(searchOptions);

    const searchResults = await client.ft.search(indexNameComments, queryString, searchOptions);
    console.log(searchResults);

    const docs = [];
    for (const searchResult of searchResults.documents) {
      docs.push({
        meta: {
          id: searchResult.id,
          score: 'TODO' // Node Redis 4 does not yet support WITHSCORES in FT.SEARCH
        },
        fields: searchResult.value
      });
    }

    return {
      meta: {
        totalResults: searchResults.total,
        offset: searchOptions.LIMIT.from,
        limit: searchOptions.LIMIT.size,
        queryString
      },
      docs
    };
  }

  const _saveComment = async function (movieId, comment) {
    // Store only the movie id number.
    if (movieId.startsWith('movie:')) {
      movieId = movieId.split(":")[1];
    }

    // Add the movie id to the comment.
    comment.movie_id = movieId;

    const ts = Date.now();
    const key = `comments:movie:${comment.movie_id}:${ts}`;
    comment.timestamp = ts;

    await client.hSet(key, comment);

    return { 
      id: key, 
      comment
    };
  }

  /**
   * Delete a comment.
   */
  const _deleteComment = async function (commentId) {
    return await client.del(commentId);
  }

  const _getCommentById = async function (commentId) {
    // Using hgetall, since the hash size is limited.
    return await client.hGetAll(commentId);
  }

  return {
    getMovie: _getMovie,
    saveMovie: _saveMovie,
    search: _search,
    getMovieGroupBy: _getMovieGroupBy,
    getCommentById: _getCommentById,
    getComments: _getComments,
    saveComment: _saveComment,
    deleteComment: _deleteComment
  };
}

export default SearchService;
