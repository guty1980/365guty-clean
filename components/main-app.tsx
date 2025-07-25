
'use client';

import { useState, useEffect } from 'react';
import { NetflixHeader } from '@/components/ui/netflix-header';
import { HeroCarousel } from '@/components/ui/hero-carousel';
import { MovieRail } from '@/components/ui/movie-rail';
import { SeriesRail } from '@/components/ui/series-rail';
import { VideoPlayer } from '@/components/ui/video-player';
import { AdminPanel } from '@/components/admin-panel';
import { TVChannels } from '@/components/tv-channels';
import { MovieDetails } from '@/components/movie-details';
import { SeriesDetails } from '@/components/series-details';
import { ChatModal } from '@/components/chat-modal';
import { Movie, Series, Channel, User } from '@/lib/types';



interface MainAppProps {
  user: User;
}

export function MainApp({ user }: MainAppProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentView, setCurrentView] = useState<'home' | 'series' | 'admin' | 'tv' | 'search'>('home');
  const [currentVideo, setCurrentVideo] = useState<{ src: string; title: string } | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar contenido al montar el componente
  useEffect(() => {
    loadMovies();
    loadSeries();
    loadChannels();
  }, []);

  const loadMovies = async () => {
    try {
      const response = await fetch('/api/movies');
      const data = await response.json();
      if (data.success) {
        setMovies(data.movies);
      }
    } catch (error) {
      console.error('Error cargando películas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSeries = async () => {
    try {
      const response = await fetch('/api/series');
      const data = await response.json();
      if (data.success) {
        setSeries(data.series);
      }
    } catch (error) {
      console.error('Error cargando series:', error);
    }
  };

  const loadChannels = async () => {
    try {
      const response = await fetch('/api/channels');
      const data = await response.json();
      if (data.success) {
        setChannels(data.channels);
      }
    } catch (error) {
      console.error('Error cargando canales:', error);
    }
  };

  const handlePlayMovie = (movie: Movie) => {
    setCurrentVideo({
      src: movie.videoUrl,
      title: movie.title,
    });
  };

  const handlePlayChannel = (channel: Channel) => {
    setCurrentVideo({
      src: channel.m3u8Url,
      title: channel.name,
    });
  };

  const handlePlaySeries = (series: Series) => {
    // En lugar de reproducir directamente, abrir el submenu de episodios
    setSelectedSeries(series);
  };

  const handlePlayEpisode = (videoUrl: string, seriesTitle: string) => {
    setCurrentVideo({
      src: videoUrl,
      title: seriesTitle,
    });
  };

  // Handlers genéricos para el carrusel - diferenciando entre movies y series
  const handlePlayMedia = (media: Movie | Series) => {
    if ('seasons' in media) {
      // Es una serie, abrir submenu
      setSelectedSeries(media as Series);
    } else {
      // Es una película, reproducir directamente
      setCurrentVideo({
        src: media.videoUrl,
        title: media.title,
      });
    }
  };



  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentView('search');
  };

  const handleShowAdmin = () => {
    setCurrentView('admin');
  };

  const handleShowMovies = () => {
    setCurrentView('home');
    setSearchQuery('');
  };

  const handleShowSeries = () => {
    setCurrentView('series');
    setSearchQuery('');
  };

  const handleShowTV = () => {
    setCurrentView('tv');
  };

  const handleShowChat = () => {
    setShowChat(true);
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSearchQuery('');
  };

  // Filtrar contenido según la búsqueda
  const filteredMovies = searchQuery 
    ? movies.filter(movie => 
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.synopsis.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : movies;

  const filteredSeries = searchQuery 
    ? series.filter(serie => 
        serie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        serie.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        serie.synopsis.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : series;

  // Agrupar películas por género
  const moviesByGenre = movies.reduce((acc, movie) => {
    if (!acc[movie.genre]) {
      acc[movie.genre] = [];
    }
    acc[movie.genre].push(movie);
    return acc;
  }, {} as Record<string, Movie[]>);

  // Agrupar series por género  
  const seriesByGenre = series.reduce((acc, serie) => {
    if (!acc[serie.genre]) {
      acc[serie.genre] = [];
    }
    acc[serie.genre].push(serie);
    return acc;
  }, {} as Record<string, Series[]>);

  // Contenido recomendado para el carrusel
  const recommendedMovies = movies.filter(movie => movie.isRecommended);
  const recommendedSeries = series.filter(serie => serie.isRecommended);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg">Cargando 365GUTY...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <NetflixHeader
        onSearch={handleSearch}
        onShowAdmin={user.isAdmin ? handleShowAdmin : undefined}
        onShowTV={handleShowTV}
        onShowMovies={handleShowMovies}
        onShowSeries={handleShowSeries}
        onShowChat={handleShowChat}
        currentView={currentView}
      />

      {/* Contenido principal */}
      <main className="pt-16">
        {currentView === 'home' && (
          <>
            {/* Carrusel principal */}
            {recommendedMovies.length > 0 && (
              <HeroCarousel
                movies={recommendedMovies}
                onPlayMovie={handlePlayMedia}
              />
            )}

            {/* Rieles de películas por género */}
            <div className="py-8 space-y-8">
              {Object.entries(moviesByGenre).map(([genre, genreMovies]) => (
                <MovieRail
                  key={genre}
                  title={genre}
                  movies={genreMovies}
                  onPlayMovie={handlePlayMovie}
                />
              ))}
            </div>
          </>
        )}

        {currentView === 'series' && (
          <>
            {/* Carrusel principal de series */}
            {recommendedSeries.length > 0 && (
              <HeroCarousel
                movies={recommendedSeries}
                onPlayMovie={handlePlayMedia}
              />
            )}

            {/* Rieles de series por género */}
            <div className="py-8 space-y-8">
              {Object.entries(seriesByGenre).map(([genre, genreSeries]) => (
                <SeriesRail
                  key={genre}
                  title={genre}
                  series={genreSeries}
                  onPlaySeries={handlePlaySeries}
                />
              ))}
            </div>
          </>
        )}

        {currentView === 'search' && (
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <button
                  onClick={handleBackToHome}
                  className="text-gray-400 hover:text-white mb-4"
                >
                  ← Volver al inicio
                </button>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Resultados de búsqueda
                </h1>
                <p className="text-gray-400">
                  {filteredMovies.length + filteredSeries.length} resultados para "{searchQuery}"
                </p>
              </div>
              
              {(filteredMovies.length > 0 || filteredSeries.length > 0) ? (
                <div className="space-y-8">
                  {filteredMovies.length > 0 && (
                    <MovieRail
                      title={`Películas (${filteredMovies.length})`}
                      movies={filteredMovies}
                      onPlayMovie={handlePlayMovie}
                    />
                  )}
                  {filteredSeries.length > 0 && (
                    <SeriesRail
                      title={`Series (${filteredSeries.length})`}
                      series={filteredSeries}
                      onPlaySeries={handlePlaySeries}
                    />
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">
                    No se encontraron resultados para tu búsqueda
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'admin' && user.isAdmin && (
          <AdminPanel
            onBack={handleBackToHome}
            onDataChange={() => {
              loadMovies();
              loadSeries();
              loadChannels();
            }}
          />
        )}

        {currentView === 'tv' && (
          <TVChannels
            channels={channels}
            onBack={handleBackToHome}
            onPlayChannel={handlePlayChannel}
          />
        )}
      </main>

      {/* Reproductor de video */}
      {currentVideo && (
        <VideoPlayer
          src={currentVideo.src}
          title={currentVideo.title}
          onClose={() => setCurrentVideo(null)}
        />
      )}

      {/* Modal de detalles de película */}
      {selectedMovie && (
        <MovieDetails
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onPlay={() => {
            handlePlayMovie(selectedMovie);
            setSelectedMovie(null);
          }}
        />
      )}

      {/* Modal de detalles de serie */}
      {selectedSeries && (
        <SeriesDetails
          series={selectedSeries}
          onClose={() => setSelectedSeries(null)}
          onPlay={(videoUrl: string, episodeTitle?: string) => {
            setCurrentVideo({
              src: videoUrl,
              title: episodeTitle || selectedSeries.title,
            });
            setSelectedSeries(null);
          }}
        />
      )}

      {/* Chat modal */}
      {showChat && (
        <ChatModal
          onClose={() => setShowChat(false)}
        />
      )}

      {/* Botón flotante de chat para usuarios no admin */}
      {!user.isAdmin && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg z-40 transition-colors"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
}
