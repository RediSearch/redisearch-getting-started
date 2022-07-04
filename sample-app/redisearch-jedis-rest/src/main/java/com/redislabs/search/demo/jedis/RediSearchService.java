package com.redislabs.search.demo.jedis;

import redis.clients.jedis.*;

import redis.clients.jedis.search.*;
import redis.clients.jedis.search.SearchResult;
import redis.clients.jedis.search.aggr.AggregationBuilder;
import redis.clients.jedis.search.aggr.AggregationResult;
import redis.clients.jedis.search.aggr.Reducers;
import redis.clients.jedis.search.aggr.SortedField;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.*;

import static redis.clients.jedis.search.RediSearchCommands.*;

@Slf4j
@Service
public class RediSearchService {

    @Autowired
    private Environment env;

    JedisPooled  client;
    // Client rediSearchClient;

    String indexName = "idx:movie"; // default name
    String redisUrl = "redis://localhost:6379"; // default name

    @PostConstruct
    private void init() throws URISyntaxException {
        log.info("Init RediSearchService");

        // Get the configuration from the application properties/environment
        indexName = env.getProperty("redis.index");
        redisUrl =  env.getProperty("redis.url");

        log.info("Configuration Index: "+indexName+" - redisUrl: "+redisUrl);

        client = new JedisPooled(new URI(redisUrl));

    }

    /** Execute the search query with
     * some parameter
     * @param queryString
     * @param offset
     * @param limit
     * @param sortBy
     * @return an object with meta: query header and docs: the list of documents
     */
    public Map<String,Object> search(String queryString, int offset, int limit, String sortBy, boolean ascending ){
        // Let's put all the informations in a Map top make it easier to return JSON object
        // no need to have "predefine mapping"
        Map<String,Object> returnValue = new HashMap<>();
        Map<String,Object> resultMeta = new HashMap<>();

        // Create a simple query
        Query query = new Query(queryString)
                                .setWithScores()
                                .limit(offset, limit);
        // if sort by parameter add it to the query
        if (sortBy != null && !sortBy.isEmpty()) {
            query.setSortBy(sortBy, ascending); // Ascending by default
        }

        // Execute the query
        SearchResult queryResult = client.ftSearch(indexName, query);

        // Adding the query string for information purpose
        resultMeta.put("queryString",queryString);

        // Get the total number of documents and other information for this query:
        resultMeta.put("totalResults", queryResult.getTotalResults());
        resultMeta.put("offset", offset);
        resultMeta.put("limit", limit);

        returnValue.put("meta", resultMeta);

        // the docs are returned as an array of document, with the document itself being a list of k/v json documents
        // not the easiest to manipulate
        // the `raw_docs` is used to view the structure
        // the `docs` will contain the list of document that is more developer friendly
        //      capture in  https://github.com/RediSearch/JRediSearch/issues/121
        // returnValue.put("raw_docs", queryResult.docs);
        returnValue.put("raw_docs", queryResult.getDocuments());


        // remove the properties array and create attributes
        List<Map<String, Object>> docsToReturn = new ArrayList<>();
        List<Document> docs =  queryResult.getDocuments();

        for (Document doc :docs) {

            Map<String,Object> props = new HashMap<>();
            Map<String,Object> meta = new HashMap<>();
            meta.put("id", doc.getId());
            meta.put("score", doc.getScore());
            doc.getProperties().forEach( e -> {
                props.put( e.getKey(), e.getValue() );
            });

            Map<String,Object> docMeta = new HashMap<>();
            docMeta.put("meta",meta);
            docMeta.put("fields",props);
            docsToReturn.add(docMeta);
        }

        returnValue.put("docs", docsToReturn);

        return returnValue;
    }

    public Map<String,Object> search(String queryString ){
        return search(queryString, 0, 10, null, true);
    }

    public Map<String,Object> getMovieGroupBy(String groupByField) {
        Map<String,Object> result = new HashMap<>();

        // Create an aggregation query that list the genre
        // FT.AGGREGATE idx:movie "*" GROUPBY 1 @genre REDUCE COUNT 0 AS nb_of_movies SORTBY 2 @genre ASC
        AggregationBuilder aggregation = new AggregationBuilder()
                .groupBy("@"+groupByField, Reducers.count().as("nb_of_movies"))
                .sortBy( SortedField.asc("@"+groupByField))
                .limit(0,1000); // get all rows

        AggregationResult aggrResult = client.ftAggregate(indexName, aggregation);
        int resultSize = aggrResult.getResults().size();

        List<Map<String, Object>> docsToReturn = new ArrayList<>();
        List<Map<String, Object>> results =  aggrResult.getResults();

        result.put("totalResults",aggrResult.totalResults);

        List<Map<String,Object>> formattedResult = new ArrayList<>();

        // get all result rows and format them
        for (int i = 0; i <  resultSize  ; i++) {
            Map<String, Object> entry =  new HashMap<>();
            entry.put(groupByField, aggrResult.getRow(i).getString(groupByField));
            entry.put("nb_of_movies", aggrResult.getRow(i).getLong("nb_of_movies"));
            formattedResult.add(entry);
        }
        result.put("rows", formattedResult);
        return result;
    }

    public Map<String,Object> searchWithJedisCommand(String queryString, int offset, int limit, String sortBy, boolean ascending) {
        Map<String,Object> returnValue = new HashMap<>();
        Map<String,Object> resultMeta = new HashMap<>();

            // Create list of parameter for the FT.SEARCH command
            List<String> commandParams = new ArrayList<>(); // TODO move to List.of when moving to new JDK
            commandParams.add(indexName);
            commandParams.add(queryString);
            commandParams.add("WITHSCORES"); // return the score in the document

            //set the limit
            commandParams.add("LIMIT");
            commandParams.add(String.valueOf(offset));
            commandParams.add(String.valueOf(limit));

            // if sortby add the paramter
            if (sortBy != null && !sortBy.isEmpty()){
                commandParams.add("SORTBY");
                commandParams.add(sortBy);
                commandParams.add((ascending)?"ASC":"DESC");

            }

            log.info(commandParams.toString());

            List result = (ArrayList)client.sendCommand(
                    com.redislabs.search.demo.jedis.util.RediSearchCommands.Command.SEARCH,
                    commandParams.toArray(new String[0]));

            // The result of the command:
            // * depends of the parameters your send (in this case it will be very simple)
            // * is a list of list, ... that matches the structure of the CLI
            //    FT.SEARCH idx:movie "@title:(heat -woman)"  => The command (not part of the result)

            // List entry #0 => number of documents
            //    1) (integer) 2

            // List entry #1  => if not parameters, the first id of the document
            //    2) "movie:1141"   => if not other option, the list of document start, and the 2nd entry is the ID of the doc

            // List entry #2  => another list, that contains a list of string, with field name, field value
            //    3)     1) "poster"
            //           2) "https://m...L_.jpg"
            //           3) "genre"
            //           4) "Drama"
            //           5) "title"
            //           6) "Heat"
            //           ...
            //          15) "plot"
            //          16) "A .. heist."
            // List entry #3,5, ... : movie id
            //    4) "movie:818"

            // List entry #4,6,8 => nother list with all the fields and values
            //    5)    1) "poster"
            //          2) "N/A"
            //          3) "genre"
            //          4) "Comedy"
            //          5) "title"
            //          6) "California Heat"
            //         ...
            //         15) "plot"
            //         16) "A ..."

            // Time to process this list.


            // the first element is always the number of results
            Long totalResults = (Long) result.get(0);
            List docs = new ArrayList<>(result.size() - 1);
            int stepForDoc = 3; // iterate over doc_id/score/values

            List<Map<String,Object>> docList = new ArrayList<>();


            if (totalResults != 0) {
                for (int i = 1; i < result.size(); i += stepForDoc) {

                    Map<String,Object> meta = new HashMap<>();
                    String docId = new String((byte[]) result.get(i));

                    Double score = Double.valueOf(new String((byte[]) result.get(i+1)));
                    meta.put("id", docId);
                    meta.put("score", score);

                    // parse the list of fields and create a map of it
                    Map<String,String> fieldsMap = new HashMap<>();
                    List<byte[]> fields =  (List<byte[]>) result.get(i + 2);
                    for (int j = 0; j < fields.size(); j += 2) {
                        String fieldName = new String((byte[]) fields.get(j));
                        String fieldValue = new String((byte[]) fields.get(j+1));
                        fieldsMap.put(fieldName, fieldValue);
                    }

                    Map<String,Object>doc = new HashMap<>();
                    doc.put("meta", meta);
                    doc.put("fields", fieldsMap);
                    docList.add(doc);
                }
            }

            resultMeta.put("totalResults", totalResults);
            resultMeta.put("queryString", queryString);
            resultMeta.put("offset", offset);
            resultMeta.put("limit", limit);

            returnValue.put("meta", resultMeta);
            returnValue.put("docs", docList);

        return returnValue;
    }

    /**
     * This method does NOT use JRediSearch library but the Jedis command directly
     *
     * This is to show the various options, since some developers want to stay as close as possible from the Redis Commands
     *
     * @param queryString
     * @return
     */
    public Map<String,Object> searchWithJedisCommand(String queryString) {
        return searchWithJedisCommand(queryString, 0, 10, null, true);
    }


}
