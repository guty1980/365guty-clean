
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Movie, Series } from '@/lib/types';

type MediaItem = Movie | Series;

interface HeroCarouselProps {
  movies: MediaItem[];
  onPlayMovie: (movie: MediaItem) => void;
  onShowMovieInfo?: (movie: MediaItem) => void;
}

export function HeroCarousel({ movies, onPlayMovie, onShowMovieInfo }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({});

  // Auto-scroll cada 5 segundos
  useEffect(() => {
    if (movies.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [movies.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToNext();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPlayMovie(movies[currentIndex]);
    } else if ((e.key === 'i' || e.key === 'I') && onShowMovieInfo) {
      e.preventDefault();
      onShowMovieInfo(movies[currentIndex]);
    }
  };

  if (!movies?.length) {
    return (
      <div className="relative h-[70vh] bg-gradient-to-r from-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-4">No hay películas recomendadas</h2>
          <p className="text-gray-400">Agrega algunas películas como recomendadas para mostrarlas aquí</p>
        </div>
      </div>
    );
  }

  const currentMovie = movies[currentIndex];

  return (
    <div className="relative h-[70vh] overflow-hidden" onKeyDown={handleKeyDown} tabIndex={0}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* Imagen de fondo */}
          <div className="absolute inset-0">
            {!imageError[currentMovie.id] ? (
              <Image
                src={currentMovie.coverUrl}
                alt={currentMovie.title}
                fill
                className="object-cover object-center"
                priority
                onError={() => 
                  setImageError(prev => ({ ...prev, [currentMovie.id]: true }))
                }
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-red-900 to-black flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="w-24 h-24 mx-auto mb-4 text-red-500" />
                  <h3 className="text-2xl font-bold">{currentMovie.title}</h3>
                </div>
              </div>
            )}
          </div>

          {/* Overlay degradado */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Contenido */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div className="mb-4">
                    <span className="inline-block bg-red-600 text-white text-sm font-bold px-3 py-1 rounded mb-4">
                      RECOMENDADO
                    </span>
                    <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
                      {currentMovie.title}
                    </h1>
                    <div className="flex items-center space-x-4 text-gray-300 mb-6">
                      <span>{currentMovie.year}</span>
                      <span>•</span>
                      <span>{currentMovie.genre}</span>
                      <span>•</span>
                      <span>
                        {'duration' in currentMovie 
                          ? `${Math.floor(currentMovie.duration / 60)}h ${currentMovie.duration % 60}m`
                          : `${currentMovie.seasons} temp. • ${currentMovie.episodes} ep.`
                        }
                      </span>
                      <span>•</span>
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span>{currentMovie.ranking.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-lg text-gray-200 leading-relaxed mb-8 max-w-xl">
                      {currentMovie.synopsis}
                    </p>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex space-x-4">
                    <Button
                      size="lg"
                      className="bg-white text-black hover:bg-gray-200 px-8 py-3 text-lg font-semibold"
                      onClick={() => onPlayMovie(currentMovie)}
                    >
                      <Play className="w-6 h-6 mr-2" />
                      Reproducir
                    </Button>
                    {onShowMovieInfo && (
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-white/50 text-white hover:bg-white/20 px-8 py-3 text-lg font-semibold"
                        onClick={() => onShowMovieInfo(currentMovie)}
                      >
                        <Info className="w-6 h-6 mr-2" />
                        Más información
                      </Button>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controles de navegación */}
      {movies.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 w-12 h-12 p-0"
            onClick={goToPrevious}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 w-12 h-12 p-0"
            onClick={goToNext}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>

          {/* Indicadores */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
            {movies.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
