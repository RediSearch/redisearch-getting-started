const express = require('express')
const cors = require('cors')
const app = express()
const serverPort = process.env.SERVER_PORT || 8086;



const SearchService = require('./NodeSearchService');
const searchService = new SearchService()

app.use(cors())


app.get('/api/1.0/movies/search', (req, res) => {
  let queryString = req.query["q"];
  let offset = Number((req.query["offset"])?req.query["offset"]:"0");
  let limit = Number((req.query["limit"])?req.query["limit"]:"10");
  let sortBy = req.query["sortby"];
  let ascending = req.query["ascending"];

  let options = {
    offset : offset,
    limit : limit
  }

  if (sortBy) {
    options.sortBy = sortBy;
    options.ascending = true; // if sorted by default it is asceending
  }

  if (ascending) {
    options.ascending = (ascending==1 || ascending.toLocaleLowerCase()==="true");
  }
  
  searchService.search(
      queryString,            // query string
      options,                     // options
      function(err, result){  // callbacl
          res.json(result);
      });
})


app.get('/api/1.0/', (req, res) => {
    res.json({"status" : "started"});
})
  

app.get('/', (req, res) => {
  res.send('RediSearch Node REST Server Started')
})

app.listen(serverPort, () => {
  console.log(`RediSearch Node listening at http://localhost:${serverPort}`)
})
