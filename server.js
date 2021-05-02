require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { getPopular, getSearch, getMovie, getCredits, getCastDetail } = require('./lib/fixer-service');

const app = express();
const port = process.env.PORT || 3000;

// Set public folder as root
app.use(express.static('public'));

// Parse POST data as URL encoded data
app.use(bodyParser.urlencoded({
  extended: true,
}));

// Parse POST data as JSON
app.use(bodyParser.json());

// Provide access to node_modules folder
app.use('/scripts', express.static(`${__dirname}/node_modules/`));


const errorHandler = (err, req, res) => {
  if (err.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    res.status(403).send({ title: 'Server responded with an error', message: err.message });
  } else if (err.request) {
    // The request was made but no response was received
    res.status(503).send({ title: 'Unable to communicate with server', message: err.message });
  } else {
    // Something happened in setting up the request that triggered an Error
    res.status(500).send({ title: 'An unexpected error occurred', message: err.message });
  }
};

// Fetch Popular Movies
app.get('/api/popular', async (req, res) => {
  try {
    const data = await getPopular();
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (error) {
    errorHandler(error, req, res);
  }
});

// Fetch Search
app.get('/api/search', async (req, res) => {
  try {
    let query = req.query.query;
    let page = req.query.page;
    const data = await getSearch(query, page);
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (error) {
    errorHandler(error, req, res);
  }
});

// Fetch Movie
app.get('/api/movie', async (req, res) => {
  try {
    let movieId = req.query.id;
    const data = await getMovie(movieId);
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (error) {
    errorHandler(error, req, res);
  }
});

// Fetch Cast
app.get('/api/credits', async (req, res) => {
  try {
    let movieId = req.query.id;
    const data = await getCredits(movieId);
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (error) {
    errorHandler(error, req, res);
  }
});

// Fetch Cast Detail
app.get('/api/castDetail', async (req, res) => {
  try {
    let personId = req.query.id;
    const data = await getCastDetail(personId);
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (error) {
    errorHandler(error, req, res);
  }
});

// Redirect all traffic to index.html
app.use((req, res) => res.sendFile(`${__dirname}/public/index.html`));

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log('listening on %d', port);
});
