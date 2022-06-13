from flask import Flask, request, json, jsonify
from flask_cors import CORS

import redis
from os import environ
from redis.commands.search import reducers
from redis.commands.search.query import NumericFilter, Query
import redis.commands.search.aggregation as aggregations

redis_password = ""
if environ.get('REDIS_SERVER') is not None:
    redis_server = environ.get('REDIS_SERVER')
    print("passed in redis server is " + redis_server)
else:
    redis_server = 'localhost'
    print("no passed in redis server variable ")

if environ.get('REDIS_PORT') is not None:
    redis_port = int(environ.get('REDIS_PORT'))
    print("passed in redis port is " + str(redis_port))
else:
    redis_port = 6379
    print("no passed in redis port variable ")

if environ.get('SERVER_PORT') is not None:
    server_port = int(environ.get('SERVER_PORT'))
    print("passed in redis port is " + str(server_port))
else:
    server_port = 8087
    print("no passed in redis port variable ")

if environ.get('REDIS_INDEX') is not None:
    redis_index = environ.get('REDIS_INDEX')
    print("passed in category file location " + redis_index)
else:
    redis_index = "idx:movie"
    print("no passed in redis index using idx:movie")

if environ.get('REDIS_PASSWORD') is not None:
    redis_password = environ.get('REDIS_PASSWORD')
    print("passed in redis password is " + redis_password)

# conn = redis.StrictRedis(redis_server, redis_port)
if redis_password is not None:
    conn = redis.StrictRedis(redis_server, redis_port, password=redis_password, charset="utf-8", decode_responses=True)
else:
    conn = redis.StrictRedis(redis_server, redis_port, charset="utf-8", decode_responses=True)

app = Flask(__name__)
CORS(app)


# @app.before_request
# @app.route('/')
# def home():
#     return {"status": "Python REST Servicve is UP", "api": "/api/1.0/search"}


@app.route('/api/1.0/movies/search')
def search():
    print("calling search")
    offset = 0;
    limit = 10;
    queryString = "";

    if (request.args.get('offset')):
        offset = int(request.args.get('offset'));

    if (request.args.get('limit')):
        limit = int(request.args.get('limit'));

    if (request.args.get('q')):
        queryString = request.args.get('q');
    print("query string is " + queryString)
    q = Query(queryString).with_scores().paging(offset, limit);
    if (request.args.get('sortby')):
        ascending = True;
        if (request.args.get('ascending')):
            ascending = (request.args.get('ascending').lower() == "true" or request.args.get('ascending') == "1");

        q.sort_by(request.args.get('sortby'), asc=ascending);

    searchResult = conn.ft(index_name=redis_index).search(q);

    dictResult = {
        "meta": {
            "totalResults": getattr(searchResult, "total"),
            "offset": offset,
            "limit": limit,
            "queryString": queryString},
        "docs": docs_to_dict(searchResult.docs)
    };

    return dictResult;


@app.route('/api/1.0/movies/group_by/<field>')
def get_movie_group_by(field):
    print("groupby field " + field)
    req = aggregations.AggregateRequest("*").group_by(
        "@" + field,
        reducers.count().alias("nb_of_movies")
    ).sort_by(aggregations.Asc("@" + field)).limit(0, 1000);

    res = conn.ft(index_name=redis_index).aggregate(req)

    reslist = []
    for i in range(0, len(res.rows)-1):
       results = res.rows[i]
       # print(results)
       interim_results = json.dumps(results)
       final_results = json.loads(interim_results)
       reslist.append(final_results);

    dictResult = jsonify(reslist, 200)

    return dictResult;


@app.route('/api/1.0/movies/<movie_id>', methods=['POST', 'GET'])
def get_movie_by_id(movie_id):
    dictResult = {
        "messsage": "This movie endpoint is not implemented in Java, use the Node.js Endpoint"
    };
    return dictResult, 501;


@app.route('/api/1.0/movies/<movie_id>/comments', methods=['POST', 'GET'])
def get_movie_comments(movie_id):
    dictResult = {
        "messsage": "Comment API not implemented in Python, use the Node.js Endpoint"
    };
    return dictResult, 501;


@app.route('/api/1.0/comments/<movie_id>', methods=['DELETE', 'GET'])
def get_comment(movie_id):
    dictResult = {
        "messsage": "Comment API not implemented in Python, use the Node.js Endpoint"
    };
    return dictResult, 501;


def docs_to_dict(docs):
    reslist = []
    for doc in docs:
        meta = {"id": getattr(doc, "id"), "score": getattr(doc, "score")}
        fields = {}
        for field in dir(doc):
            if (field.startswith('__') or field == 'id' or field == 'score'):
                continue
            fields.update({field: getattr(doc, field)})
        ddict = {"meta": meta, "fields": fields};
        reslist.append(ddict)
    return reslist


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=server_port);
