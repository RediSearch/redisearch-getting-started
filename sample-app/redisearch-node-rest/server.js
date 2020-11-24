const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const serverPort = process.env.SERVER_PORT || 8086;



const SearchService = require('./NodeSearchService');
const searchService = new SearchService();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());

app.get('/api/1.0/movies/search', (req, res) => {
  const queryString = req.query.q;
  const offset = Number((req.query.offset)?req.query.offset:'0');
  const limit = Number((req.query.limit)?req.query.limit:'10');
  const sortBy = req.query.sortby;
  const ascending = req.query.ascending;

  const options = {
    offset,
    limit
  };

  if (sortBy) {
    options.sortBy = sortBy;
    options.ascending = true; // if sorted by default it is ascending
  }

  if (ascending) {
    options.ascending = (ascending==1 || ascending.toLocaleLowerCase()==='true');
  }
  
  searchService.search(
    queryString,            // query string
    options,                // options
    function(err, result){  // callback
      res.json(result);
    }
  );
})

app.get('/api/1.0/movies/group_by/:field', (req, res) =>{
  searchService.getMovieGroupBy(req.params.field, function(err, result){
    res.json(result);
  });
});

app.get('/api/1.0/movies/:id', (req, res) =>{
  searchService.getMovie(req.params.id, function(err, result){
    res.json(result);
  });
});

app.post('/api/1.0/movies/:id', (req, res) =>{
  searchService.saveMovie(req.params.id, req.body, function(err, result){
    res.json(result);
  });
});

app.get('/api/1.0/movies/:id/comments', (req, res) =>{
  searchService.getComments(req.params.id, {}, function(err, result){
    res.json(result);
  });
});

app.post('/api/1.0/movies/:id/comments', (req, res) =>{
  searchService.saveComment(req.params.id, req.body, function(err, result){
    res.json(result);
  });
});

app.get('/api/1.0/comments/:id', (req, res) =>{
  searchService.getCommentById(req.params.id, function(err, result){
    res.json(result);
  });
});

app.delete('/api/1.0/comments/:id', (req, res) =>{
  searchService.deleteComment(req.params.id, function(err, result){
    res.json(result);
  });
});

app.get('/api/1.0/', (req, res) => {
  res.json({status: 'started'});
});
  
app.get('/', (req, res) => {
  res.send('RediSearch Node REST Server Started');
});

app.listen(serverPort, () => {
  console.log(`RediSearch Node listening at http://localhost:${serverPort}`);
});
