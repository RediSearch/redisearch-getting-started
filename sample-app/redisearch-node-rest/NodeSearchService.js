const redis = require('redis');
const redisearch = require('redis-redisearch');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const indexName = process.env.REDIS_INDEX || 'idx:movie';

console.log(`Configuration Index: ${indexName} - redisUrl: ${redisUrl}`);

redisearch(redis);
const client = redis.createClient(redisUrl);


const SearchService = function () {

  const _search = function (queryString, options, callback) {

    let offset = 0; // default values
    let limit = 10; // default value


    // prepare the "native" FT.SEARCH call
    // FT.SEARCH IDX_NAME queryString  [options]
    const searchParams = [
      indexName,    // name of the index
      queryString,  // query string
      'WITHSCORES'  // return the score
    ];

    // if limit add the parameters
    if (options.offset || options.limit) {
      offset = options.offset || 0;
      limit = options.limit || 10
      searchParams.push('LIMIT');
      searchParams.push(offset);
      searchParams.push(limit);
    }
    // if sortby add the parameters  
    if (options.sortBy) {
      searchParams.push('SORTBY');
      searchParams.push(options.sortBy);
      searchParams.push((options.ascending) ? 'ASC' : 'DESC');
    }

    console.log(searchParams);

    client.ft_search(
      searchParams,
      function (err, searchResult) {

        const totalNumberOfDocs = searchResult[0];
        const result = {
          meta: {
            totalResults: totalNumberOfDocs,
            offset,
            limit,
            queryString,
          },
          docs: [],
          raw_docs: searchResult
        }

        // create JSON document from n/v pairs
        for (let i = 1; i <= searchResult.length - 1; i++) {
          const doc = {
            meta: {
              score: Number(searchResult[i + 1]),
              id: searchResult[i]
            }
          };
          i = i + 2;
          doc.fields = {};
          const fields = searchResult[i]
          if (fields) {
            for (let j = 0, len = fields.length; j < len; j++) {
              const idxKey = j;
              const idxValue = idxKey + 1;
              j++;
              doc.fields[fields[idxKey]] = fields[idxValue];
            }
          }
          result.docs.push(doc);
        }

        callback(err, result);
      }
    );

  }

  const _getMovieGroupBy = function (field, callback) {
    const retValue = {
      totalResults: 0,
      rows: [],
      raw: [] // get the data as returned by the API
    };

    // prepare the "native" FT.AGGREGATE call
    // FT.AGGREGATE IDX_NAME queryString  [options]
    const pipeline = [
      indexName,      // name of the index
      '*',            // query string,
      'GROUPBY', '1', `@${field}`, // group by
      'REDUCE', 'COUNT', '0', 'AS', 'nb_of_movies', //count the number of movies by group
      'SORTBY', '2', `@${field}`, 'ASC', // sorted by the genre
      'LIMIT', '0', '1000'  // get all genre expecting less than 100 genres
    ];

    client.ft_aggregate(
      pipeline,
      function (err, aggrResult) {

        // transform array into document
        // this should be added to a generic function
        // ideally into the library itself
        retValue.totalResults = aggrResult[0];

        // loop on the results starting at element 1
        for (let i = 1; i <= aggrResult.length - 1; i++) {
          const item = aggrResult[i];
          const doc = {};
          for (let j = 0, len = item.length; j < len; j++) {
            doc[item[j]] = item[j + 1];
            doc[item[j + 2]] = item[j + 3];
            j = j + 3;
          }
          retValue.rows.push(doc);
        }
        retValue.raw = aggrResult;
        callback(err, retValue);
      });

  }

  return {
    search: _search,
    getMovieGroupBy: _getMovieGroupBy
  };
}

module.exports = SearchService;
