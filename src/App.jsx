import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import MovieDetails from './components/MovieDetails.jsx'
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite.js'

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const HomePage = () => {
  const navigate = useNavigate();
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [searchTerm, setSearchTerm] = useState('');

  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [trendingMovies, setTrendingMovies] = useState([]);

  // Debounce the search term to prevent making too many API requests
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 1000, [searchTerm])

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if(!response.ok) {
        throw new Error(`Failed to fetch movies: ${response.status}`);
      }

      const data = await response.json();

      if(data.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);

      if(query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  // Handle click on movie poster
  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  return (
    <main>
      <div className="pattern"/>

      <div className="wrapper">
        <header>
          <img src="/hero.png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2 className='py-5'>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id} onClick={() => handleMovieClick(movie.movie_id)} className="cursor-pointer hover:opacity-80 transition-opacity">
                  <p>{index + 1}</p>
                  <div className="trending-poster-container">
                    <img src={movie.poster_url} alt={movie.movie_title} />
                    <h3 className="movie-title text-white gap-y-2 mt-2 mx-2 py-2">{movie.movie_title}</h3>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>All Movies</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <div key={movie.id} onClick={() => handleMovieClick(movie.id)} className="cursor-pointer hover:opacity-80 transition-opacity">
                  <MovieCard movie={movie}/>
                </div>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
      </Routes>
    </Router>
  )
}

export default App