window.addEventListener('load', () => {
  const el = $('#app');
  $('table').tablesort();
  // Compile Handlebar Templates
  const errorTemplate = Handlebars.compile($('#error-template').html());
  const popMoviesTemplate = Handlebars.compile($('#popMovies-template').html());
  const searchTemplate = Handlebars.compile($('#search-template').html());
  const resultTemplateHorizontal = Handlebars.compile($('#segment-horizontal').html());
  const resultTemplateVertical = Handlebars.compile($('#segment-vertical').html());
  const movieModalTemplate = Handlebars.compile($('#movie-modal-template').html())
  const creditModalTemplate = Handlebars.compile($('#credit-modal-template').html())
  const castDetailModalTemplate = Handlebars.compile($('#cast-detail-modal-template').html())

  // Instantiate api handler
  const api = axios.create({
    baseURL: '/api',
    timeout: 5000,
  });

  const router = new Router({
    mode: 'history',
    page404: (path) => {
      const html = errorTemplate({
        color: 'yellow',
        title: 'Error 404 - Page NOT Found!',
        message: `The path '/${path}' does not exist on this site`,
      });
      el.html(html);
    },
  });

  // Display Error Banner
  const showError = (error) => {
    const { title, message } = error.response.data;
    const html = errorTemplate({ color: 'red', title, message });
    el.html(html);
  };

  // Display Popular Movies
  router.add('/', async () => {
    // Display loader first
    let html = popMoviesTemplate();
    el.html(html);
    try {
      // Load Popular Movies
      const response = await api.get('/popular');
      const { page, results } = response.data;
      // Display Popular Movies Template
      html = popMoviesTemplate({ page, results });
      el.html(html);
      $('.loading').removeClass('loading');
      $('table').tablesort();
    } catch (error) {
      showError(error);
    }
  });

  // Perform POST request
  const getSearchResults = async () => {
    // Extract form data
    const query = $('#search').val();
    const page = $('#page').val() ? $('#page').val() : 1;
    // Send post data to express(proxy) server
    try {
      const response = await api.get('/search', {
        params: {
          query: query,
          page: page
        }
      });
      // const { response } = response.data;
      window.searchResults = response.data.results;
      //console.log(response);
      displaySearchResult(window.searchResults);
    } catch (error) {
      showError(error);
    } finally {
      $('#result-segment').removeClass('loading');
    }
  };

  const displaySearchResult = (searchResults) => {
    let html = window.searchView == 'grid' ? resultTemplateHorizontal(groupSearchByThree(searchResults)) : resultTemplateVertical(searchResults);

    $('#search-result').html(html)
    $('table').tablesort();
  }

  const groupSearchByThree = (searchResults) => {
    if (searchResults && searchResults.length > 0) {
      const groupByThree = searchResults.reduce(function (result, value, index, array) {
        if (index % 3 === 0)
          result.push(array.slice(index, index + 3));
        return result;
      }, []);
      //console.log(groupByThree);
      return groupByThree
    }
    else return []
  }

  // Handle Search Button Click Event
  const searchHandler = () => {
    if ($('.ui.form').form('is valid')) {
      // hide error message
      $('.ui.error.message').hide();
      // Post to express server
      $('#result-segment').addClass('loading');
      getSearchResults();
      // Prevent page from submitting to server
      return false;
    }
    return true;
  };

  const listViewHandler = (e) => {
    e.preventDefault();
    window.searchView = 'list';
    $('#list-view').addClass('active');
    $('#grid-view').removeClass('active');
    if (!window.searchResults || window.searchResults.length == 0) return
    $('#search-result').empty();
    let searchResultVertical = resultTemplateVertical(window.searchResults);
    $('#search-result').html(searchResultVertical)
    $('table').tablesort();
  }

  const gridViewHandler = (e) => {
    e.preventDefault();
    window.searchView = 'grid';
    $('#grid-view').addClass('active');
    $('#list-view').removeClass('active');
    if (!window.searchResults || window.searchResults.length == 0) return
    $('#search-result').empty();
    let searchResultHorizontal = resultTemplateHorizontal(groupSearchByThree(window.searchResults));
    $('#search-result').html(searchResultHorizontal)
    $('table').tablesort();
  }

  router.add('/search', async () => {
    // Display loader first
    if (window.searchResults && window.searchResults.length > 0) {
      let html = searchTemplate();
      el.html(html);
      displaySearchResult(window.searchResults);
      $('table').tablesort();
      $('.loading').removeClass('loading');
      $('#searchBtn').on('click', searchHandler);
      $('#list-view').on('click', listViewHandler);
      $('#grid-view').on('click', gridViewHandler);
    }
    else {
      let html = searchTemplate();
      window.searchView = 'grid';
      el.html(html);
      try {
        // Load Search
        const response = await api.get('/search');
        const { symbols } = response.data;
        html = searchTemplate({ symbols });
        el.html(html);
        $('.loading').removeClass('loading');
        // Specify Form Validation Rules
        $('.ui.form').form({
          fields: {
            search: 'empty'
          },
        });
        // Specify Submit Handler
        $('#search').on('keydown', searchInputHandler);
        $('#searchBtn').on('click', searchHandler);
        $('#list-view').on('click', listViewHandler);
        $('#grid-view').on('click', gridViewHandler);
      } catch (error) {
        showError(error);
      }
    }
  });

  function searchInputHandler(event) {
    if (event.which == 13 || event.keyCode == 13) {
      //code to execute here
      searchHandler();
      return false;
    }
    return true;
  }

  async function openModal(modalType, id) {
    switch (modalType) {
      case 'movie':
        await handleMovieModal(id)
        break;
      
      case 'cast':
        await handleCreditsModal(id)
        break;

      case 'castDetail':
        await handleCastDetailModal(id)
        break;
      default:
        break;
    }
    
  }

  async function handleMovieModal(movieId) {
    try {
      const response = await api.get('/movie', {
        params: {
          id: movieId
        }
      });

      const data = response.data;
      $('.ui.modal').remove();
      let html = movieModalTemplate(data);
      $('#modal').html(html);
      $('.ui.modal').modal({
        onHide: function (e) {
          $('.ui.modal').empty();
          $('#modal').empty();
        }
      }).modal('show');
    } catch (error) {
      showError(error);
    } finally {
    }
  }

  async function handleCreditsModal(movieId) {
    try {
      const response = await api.get('/credits', {
        params: {
          id: movieId
        }
      });
      window.creditsId = movieId;
      const data = response.data;
      $('.ui.modal').remove();
      let html = creditModalTemplate(data);
      $('#modal').html(html);
      $('.ui.modal').modal({
        onHide: function (e) {
          $('.ui.modal').empty();
          $('#modal').empty();
        }
      }).modal('show');
    } catch (error) {
      showError(error);
    } finally {
    }
  }

  async function handleCastDetailModal(personId) {
    try {
      const response = await api.get('/castDetail', {
        params: {
          id: personId
        }
      });

      const data = response.data;
      $('.ui.modal').remove();
      let html = castDetailModalTemplate(data);
      $('#modal').html(html);
      $('.ui.modal').modal({
        onHide: function (e) {
          $('.ui.modal').empty();
          $('#modal').empty();
        }
      }).modal('show');
    } catch (error) {
      showError(error);
    } finally {
    }
  }

  function closeModal() {
    $('.ui.modal').modal('hide');
  }

  window.openModal = openModal;
  window.closeModal = closeModal;

  router.navigateTo(window.location.pathname);

  // Highlight Active Menu on Load
  const link = $(`a[href$='${window.location.pathname}']`);
  link.addClass('active');

  $('a').on('click', (event) => {
    // Block page load
    event.preventDefault();

    // Highlight Active Menu on Click
    const target = $(event.target);
    $('.item').removeClass('active');
    target.addClass('active');

    // Navigate to clicked url
    const href = target.attr('href');
    const path = href.substr(href.lastIndexOf('/'));
    router.navigateTo(path);
  });
});
