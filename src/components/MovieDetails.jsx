import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const useFetch = (id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMovieDetails = useCallback(async () => {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/movie/${id}`, API_OPTIONS);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching movie details:", error);
      throw error;
    }
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchMovieDetails();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchMovieDetails]);

  return { data, loading, error };
};

const MovieInfo = ({ label, value }) => (
  <div className="flex flex-col items-start justify-center mt-4">
    <p className="text-gray-400 text-sm">{label}</p>
    <p className="text-gray-200 font-bold text-sm mt-1">
      {value || "N/A"}
    </p>
  </div>
);

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { data: movie, loading, error } = useFetch(id);

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center flex-col">
        <p className="text-red-500 text-xl">Error loading movie details: {error.message}</p>
        <button
          className="mt-5 bg-blue-600 rounded-lg py-3.5 px-6 flex flex-row items-center justify-center"
          onClick={() => navigate(-1)}
        >
          <span className="text-white font-semibold text-base">Go Back</span>
        </button>
      </div>
    );
  }
  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3 flex-shrink-0 relative">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie?.poster_path}`}
              alt={movie?.title}
              className="w-full rounded-lg shadow-lg"
            />
            <button className="absolute bottom-4 right-4 rounded-full w-12 h-12 bg-white flex items-center justify-center shadow-lg">
              <img
                src="/play.png"
                className="w-5 h-6 ml-0.5"
                alt="Play trailer"
              />
            </button>
          </div>
          <div className="md:w-2/3">
            <h1 className="text-white font-bold text-3xl mb-2">{movie?.title}</h1>           
            <div className="flex items-center gap-x-2 mb-4">
              <span className="text-gray-400 text-sm">
                {movie?.release_date?.split("-")[0]} •
              </span>
              <span className="text-gray-400 text-sm">{movie?.runtime}m</span>
              
              <div className="flex items-center bg-gray-800 px-2 py-1 rounded-md gap-x-1 ml-2">
                <img src="/star.svg" className="w-4 h-4" alt="Rating" />
                <span className="text-white font-bold text-sm">
                  {Math.round(movie?.vote_average ?? 0)}/10
                </span>
                <span className="text-gray-400 text-sm">
                  ({movie?.vote_count} votes)
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <MovieInfo label="Overview" value={movie?.overview} />
              <MovieInfo
                label="Genres"
                value={movie?.genres?.map((g) => g.name).join(" • ") || "N/A"}
              />
              <div className="flex flex-row justify-between w-full md:w-2/3">
                <MovieInfo
                  label="Budget"
                  value={`$${(movie?.budget ?? 0) / 1_000_000} million`}
                />
                <MovieInfo
                  label="Revenue"
                  value={`$${Math.round(
                    (movie?.revenue ?? 0) / 1_000_000
                  )} million`}
                />
              </div>
              <MovieInfo
                label="Production Companies"
                value={
                  movie?.production_companies?.map((c) => c.name).join(" • ") ||
                  "N/A"
                }
              />
            </div>
          </div>
        </div>
      </div>
      <button
        className="fixed bottom-5 left-0 right-0 mx-auto max-w-xs bg-blue-600 rounded-lg py-3.5 flex flex-row items-center justify-center z-50 cursor-pointer"
        onClick={() => navigate(-1)}
      >
        <img
          src="/arrow.png"
          className="w-5 h-5 mr-1 mt-0.5 rotate-180"
          alt="Go back"
        />
        <span className="text-white font-semibold text-base">Go Back</span>
      </button>
    </div>
  );
};

export default MovieDetails;