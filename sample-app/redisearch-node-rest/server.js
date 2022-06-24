import express from 'express';
import cors from 'cors';
import SearchService from './NodeSearchService.js';

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const serverPort = process.env.SERVER_PORT || 8086;
const searchService = new SearchService();

app.get('/api/1.0/movies/search', async (req, res) => {
  const queryString = req.query.q;
  const offset = Number((req.query.offset) ? req.query.offset : 0);
  const limit = Number((req.query.limit) ? req.query.limit : 10);
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
    options.ascending = (ascending ==1 || ascending.toLocaleLowerCase() === 'true');
  }
  
  return res.json(await searchService.search(queryString, options));
});

app.get('/api/1.0/movies/group_by/:field', async (req, res) => res.json(await searchService.getMovieGroupBy(req.params.field)));

app.get('/api/1.0/movies/:id', async (req, res) => res.json(await searchService.getMovie(req.params.id)));

app.post('/api/1.0/movies/:id', async (req, res) => res.json(await searchService.saveMovie(req.params.id, req.body)));

app.get('/api/1.0/movies/:id/comments', async (req, res) => res.json(await searchService.getComments(req.params.id, {})));

app.post('/api/1.0/movies/:id/comments', async (req, res) => res.json(await searchService.saveComment(req.params.id, req.body)));

app.get('/api/1.0/comments/:id', async (req, res) => res.json(await searchService.getCommentById(req.params.id)));

app.delete('/api/1.0/comments/:id', async (req, res) => res.json(await searchService.deleteComment(req.params.id)));

app.get('/api/1.0/', (req, res) => res.json({ status: 'started' }));
  
app.get('/', (req, res) => res.send('RediSearch Node REST Server Started'));

app.listen(serverPort, () => console.log(`RediSearch Node REST Server listening at http://localhost:${serverPort}`));
