const redis       = require('redis');
const redisearch  = require('redis-redisearch');

let redisUrl = process.env.REDIS_URL || "redis://localhost:6369";
let indexName = process.env.REDIS_INDEX || "idx:movie";

console.log("Configuration Index: "+indexName+" - redisUrl: "+redisUrl);

redisearch(redis);
let client = redis.createClient(redisUrl);


let SearchService = function() {

    let _search = function(queryString, options, callback) {

        let offset = 0; // default values
        let limit = 10; // default value

        
        // prepare the "native" FT.SEARCK call
        // FT.SEARCH IDX_NAME queryString  [options]
        let searchParams = [
            indexName,    // name of thje inde
            queryString,  // query string,
            "WITHSCORES"  // return the score
        ];

        // if limit add the parameters
        if (options.offset || options.limit ) {
            offset = options.offset||0;
            limit = options.limit||10
            searchParams.push("LIMIT");
            searchParams.push(offset);
            searchParams.push(limit);
        }
        // if sortby add the parameters  
        if (options.sortBy) {
            searchParams.push("SORTBY");
            searchParams.push(options.sortBy);
            searchParams.push( (options.ascending)?"ASC":"DESC"  );
            
        }

        console.log( searchParams );

        client.ft_search( 
            searchParams,
            function(err, searchResult) {

                let totalNumberOfDocs = searchResult[0];
                let result = {
                    "meta" : {
                        "totalResults" : totalNumberOfDocs,
                        "offset" : offset,
                        "limit" : limit,
                        "queryString" : queryString,
                    },
                    "docs" : [],
                    "raw_docs" : searchResult
                }

                // create JSON document from n/v paires
                for (var i = 1; i <= searchResult.length-1 ; i++){
                    let doc = {
                        meta : {
                            score : Number(searchResult[i+1]),
                            id : searchResult[i],
                        }
                    };
                    i = i+2;
                    doc.fields = {};
                    let fields = searchResult[i]          
                    if (fields) {
                        for (var j=0, len=fields.length; j < len; j++) {
                            let idxKey = j;
                            let idxValue =idxKey+1;
                            j++;
                            doc.fields[fields[idxKey]] = fields[idxValue];
                        }    
                    }
                    result.docs.push(doc)                    
                }



                callback(err,result);
            }
        );

    }

    return {
        search: _search,
    };

}

module.exports = SearchService;
