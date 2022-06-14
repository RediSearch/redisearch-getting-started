sleep 15
redis-cli -h redisearch -p 6379 < /dataset/import_actors.redis
redis-cli -h redisearch -p 6379 < /dataset/import_movies.redis
redis-cli -h redisearch -p 6379 < /dataset/import_users.redis
redis-cli -h redisearch -p 6379 < /dataset/import_create_index.redis
exit
