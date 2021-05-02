require('dotenv').config();
const axios = require('axios');

const symbols = process.env.SYMBOLS || 'EUR,USD,GBP';
const token = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4ZWFkZDE5NWRmYmI0ZDkwMWZlNzJmNmE3YzdhZDUxOSIsInN1YiI6IjYwOGRlMTYyOWU0MDEyMDA2ZjNjZTU5YyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.p7-2QArkM7Mhdg-iOsO0redvWLCKHgw1X7bKu0Pftds';
const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: {'Authorization': 'Bearer '+token},
  timeout: process.env.TIMEOUT || 5000,
});

const get = async (url) => {
  const response = await api.get(url);
  const { data } = response;
  if (response.status == 200) {
    return data;
  }
  throw new Error(data.error.type);
};

module.exports = {
  getPopular: () => get(`/movie/popular`),
  getSearch: ( query, page ) => get(`/search/movie?language=en-US&query=${query}&page=${page}&include_adult=false`),
  getMovie: (movieId) => get(`/movie/${movieId}`),
  getCredits: (movieId) => get(`/movie/${movieId}/credits`),
  getCastDetail: (personId) => get(`/person/${personId}`)
};
