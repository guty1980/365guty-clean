

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Play, Star, Monitor, Calendar, Layers, ChevronLeft, Clock, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Series, Season, Episode } from '@/lib/types';

interface SeriesDetailsProps {
  series: Series;
  onClose: () => void;
  onPlay: (videoUrl: string, episodeTitle?: string) => void;
}

type ViewMode = 'seasons' | 'episodes';

export function SeriesDetails({ series, onClose, onPlay }: SeriesDetailsProps) {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('seasons');
  
  // Estado para datos
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);

  useEffect(() => {
    loadSeasons();
  }, [series.id]);

  const loadSeasons = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/seasons?seriesId=${series.id}`);
      const data = await response.json();
      if (data.success) {
        setSeasons(data.seasons);
      }
    } catch (error) {
      console.error('Error cargando temporadas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEpisodes = async (seasonId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/episodes?seasonId=${seasonId}`);
      const data = await response.json();
      if (data.success) {
        setEpisodes(data.episodes);
      }
    } catch (error) {
      console.error('Error cargando episodios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeasonSelect = (season: Season) => {
    setSelectedSeason(season);
    setViewMode('episodes');
    loadEpisodes(season.id);
  };

  const handleBackToSeasons = () => {
    setViewMode('seasons');
    setSelectedSeason(null);
    setEpisodes([]);
  };

  const handleEpisodePlay = (episode: Episode) => {
    const episodeTitle = `${series.title} - T${selectedSeason?.number}E${episode.number}: ${episode.title}`;
    onPlay(episode.videoUrl, episodeTitle);
  };

  const handleSeriesTrailerPlay = () => {
    onPlay(series.videoUrl, `${series.title} - Trailer`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        if (viewMode === 'episodes') {
          handleBackToSeasons();
        } else {
          onClose();
        }
        break;
      case 'Backspace':
        e.preventDefault();
        if (viewMode === 'episodes') {
          handleBackToSeasons();
        } else {
          onClose();
        }
        break;
      case 'ArrowLeft':
        if (e.ctrlKey) {
          e.preventDefault();
          if (viewMode === 'episodes') {
            handleBackToSeasons();
          }
        }
        break;
    }
  };

  return (
    <div 
      className="netflix-modal"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        transition={{ duration: 0.3 }}
        className="netflix-modal-content max-w-5xl"
      >
        {/* Header con imagen */}
        <div className="relative h-80 bg-gray-900 rounded-t-lg overflow-hidden">
          {!imageError ? (
            <Image
              src={selectedSeason?.coverUrl || series.coverUrl}
              alt={selectedSeason ? `${series.title} - Temporada ${selectedSeason.number}` : series.title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <Monitor className="w-16 h-16 text-gray-400" />
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
          
          {/* Botón cerrar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-black/50 w-10 h-10 p-0"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Navegación - Botón volver */}
          {viewMode === 'episodes' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToSeasons}
              className="absolute top-4 left-4 text-white hover:bg-black/50 focus:bg-black/60 focus:ring-2 focus:ring-white/50 px-3 py-2"
              autoFocus
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Volver a Temporadas
            </Button>
          )}

          {/* Contenido sobre la imagen */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center space-x-2 mb-4">
              {series.isRecommended && (
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                  RECOMENDADO
                </span>
              )}
              <div className="flex items-center text-yellow-500">
                <Star className="w-4 h-4 mr-1" />
                <span className="text-white font-semibold">{series.ranking.toFixed(1)}</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-2 leading-tight">
              {series.title}
            </h1>
            
            {selectedSeason && (
              <h2 className="text-xl text-gray-200 mb-4">
                Temporada {selectedSeason.number}: {selectedSeason.title}
              </h2>
            )}
            
            <div className="flex space-x-3">
              <Button
                onClick={handleSeriesTrailerPlay}
                size="lg"
                className="bg-white text-black hover:bg-gray-200 px-6 py-3 text-lg font-semibold"
              >
                <Play className="w-5 h-5 mr-2" />
                Trailer
              </Button>
              
              <div className="flex items-center space-x-4 text-gray-300">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{series.year}</span>
                </div>
                <div className="flex items-center">
                  <Layers className="w-4 h-4 mr-1" />
                  <span>{series.seasons} temporadas</span>
                </div>
                <div className="flex items-center">
                  <Monitor className="w-4 h-4 mr-1" />
                  <span>{series.episodes} episodios</span>
                </div>
                <span className="bg-gray-700 px-2 py-1 rounded text-sm">
                  {series.genre}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">
                {viewMode === 'seasons' ? 'Cargando temporadas...' : 'Cargando episodios...'}
              </p>
            </div>
          ) : (
            <>
              {/* Vista de Temporadas */}
              {viewMode === 'seasons' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-white text-2xl font-bold mb-2">Temporadas</h3>
                    <p className="text-gray-400">Selecciona una temporada para ver sus episodios</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {seasons.map((season, index) => (
                      <motion.div
                        key={season.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => handleSeasonSelect(season)}
                      >
                        {/* Imagen de temporada o portada de serie */}
                        <div className="relative h-32 bg-gray-900">
                          <Image
                            src={season.coverUrl || series.coverUrl}
                            alt={`Temporada ${season.number}`}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                          <div className="absolute bottom-2 left-2">
                            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                              TEMPORADA {season.number}
                            </span>
                          </div>
                        </div>

                        <div className="p-4">
                          <h4 className="text-white font-semibold text-lg mb-1">
                            {season.title}
                          </h4>
                          <p className="text-gray-400 text-sm mb-2">
                            {season.year} • {season.totalEpisodes} episodios
                          </p>
                          {season.description && (
                            <p className="text-gray-300 text-sm line-clamp-2">
                              {season.description}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Sinopsis de la serie */}
                  <div className="mt-8">
                    <h3 className="text-white text-lg font-semibold mb-3">
                      Acerca de {series.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {series.synopsis}
                    </p>
                  </div>
                </div>
              )}

              {/* Vista de Episodios */}
              {viewMode === 'episodes' && selectedSeason && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-white text-2xl font-bold mb-1">
                      Temporada {selectedSeason.number}
                    </h3>
                    <h4 className="text-xl text-gray-300 mb-2">{selectedSeason.title}</h4>
                    <p className="text-gray-400">
                      {selectedSeason.year} • {episodes.length} episodios
                    </p>
                    {selectedSeason.description && (
                      <p className="text-gray-300 mt-3 leading-relaxed">
                        {selectedSeason.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    {episodes.map((episode, index) => (
                      <motion.div
                        key={episode.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-start space-x-4">
                          {/* Número del episodio */}
                          <div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">{episode.number}</span>
                          </div>

                          {/* Información del episodio */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-white font-semibold text-lg leading-tight">
                                {episode.title}
                              </h4>
                              <Button
                                onClick={() => handleEpisodePlay(episode)}
                                size="sm"
                                className="bg-white text-black hover:bg-gray-200 ml-4 flex-shrink-0"
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Reproducir
                              </Button>
                            </div>

                            <div className="flex items-center space-x-4 mb-2 text-sm text-gray-400">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>{episode.duration} min</span>
                              </div>
                              {episode.airDate && (
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  <span>{new Date(episode.airDate).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>

                            {episode.synopsis && (
                              <p className="text-gray-300 text-sm leading-relaxed">
                                {episode.synopsis}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
