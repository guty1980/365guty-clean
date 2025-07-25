
'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MovieCard } from './movie-card';
import { motion } from 'framer-motion';
import { Movie } from '@/lib/types';

interface MovieRailProps {
  title: string;
  movies: Movie[];
  onPlayMovie: (movie: Movie) => void;
  onShowMovieInfo?: (movie: Movie) => void;
}

export function MovieRail({ title, movies, onPlayMovie, onShowMovieInfo }: MovieRailProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      return () => container.removeEventListener('scroll', checkScrollButtons);
    }
  }, [movies]);

  const scrollLeft = () => {
    if (!scrollContainerRef.current) return;
    const cardWidth = 200; // Ancho aproximado de cada tarjeta
    const scrollAmount = cardWidth * 3; // Desplazar 3 tarjetas
    scrollContainerRef.current.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
  };

  const scrollRight = () => {
    if (!scrollContainerRef.current) return;
    const cardWidth = 200;
    const scrollAmount = cardWidth * 3;
    scrollContainerRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && canScrollLeft) {
      e.preventDefault();
      scrollLeft();
    } else if (e.key === 'ArrowRight' && canScrollRight) {
      e.preventDefault();
      scrollRight();
    }
  };

  if (!movies?.length) return null;

  return (
    <div className="space-y-4 group">
      {/* Título del riel */}
      <h2 className="text-white text-xl font-semibold px-4 md:px-8">
        {title}
      </h2>

      {/* Contenedor del riel */}
      <div className="relative" onKeyDown={handleKeyDown}>
        {/* Botón scroll izquierda */}
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70 w-8 h-12 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:opacity-100"
            onClick={scrollLeft}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        )}

        {/* Botón scroll derecha */}
        {canScrollRight && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70 w-8 h-12 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:opacity-100"
            onClick={scrollRight}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        )}

        {/* Contenedor scrolleable */}
        <div
          ref={scrollContainerRef}
          className="flex space-x-3 overflow-x-auto scrollbar-hide px-4 md:px-8 pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie, index) => (
            <motion.div
              key={movie.id}
              className="flex-shrink-0 w-48"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <MovieCard
                movie={movie}
                onPlay={onPlayMovie}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
