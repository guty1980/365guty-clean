
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Play, Star, Clock, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface Movie {
  id: string;
  title: string;
  synopsis: string;
  genre: string;
  year: number;
  duration: number;
  ranking: number;
  coverUrl: string;
  videoUrl: string;
  isRecommended: boolean;
}

interface MovieDetailsProps {
  movie: Movie;
  onClose: () => void;
  onPlay: () => void;
}

export function MovieDetails({ movie, onClose, onPlay }: MovieDetailsProps) {
  const [imageError, setImageError] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPlay();
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
        className="netflix-modal-content"
      >
        {/* Header con imagen */}
        <div className="relative h-80 bg-gray-900 rounded-t-lg overflow-hidden">
          {!imageError ? (
            <Image
              src={movie.coverUrl}
              alt={movie.title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <Play className="w-16 h-16 text-gray-400" />
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
          
          {/* Botón volver */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 left-4 text-white hover:bg-black/50 focus:bg-black/60 focus:ring-2 focus:ring-white/50 px-3 py-2"
            autoFocus
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </Button>

          {/* Botón cerrar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-black/50 w-10 h-10 p-0"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Contenido sobre la imagen */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center space-x-2 mb-4">
              {movie.isRecommended && (
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                  RECOMENDADO
                </span>
              )}
              <div className="flex items-center text-yellow-500">
                <Star className="w-4 h-4 mr-1" />
                <span className="text-white font-semibold">{movie.ranking.toFixed(1)}</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              {movie.title}
            </h1>
            
            <Button
              onClick={onPlay}
              size="lg"
              className="bg-white text-black hover:bg-gray-200 px-8 py-3 text-lg font-semibold"
            >
              <Play className="w-6 h-6 mr-2" />
              Reproducir
            </Button>
          </div>
        </div>

        {/* Información detallada */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Información principal */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 text-gray-300 mb-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{movie.year}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
                </div>
                <span className="bg-gray-700 px-2 py-1 rounded text-sm">
                  {movie.genre}
                </span>
              </div>
              
              <h3 className="text-white text-lg font-semibold mb-3">
                Sinopsis
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {movie.synopsis}
              </p>
            </div>

            {/* Información adicional */}
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Género</h4>
                <p className="text-gray-300">{movie.genre}</p>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-2">Año</h4>
                <p className="text-gray-300">{movie.year}</p>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-2">Duración</h4>
                <p className="text-gray-300">
                  {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                </p>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-2">Calificación</h4>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-white font-semibold">
                    {movie.ranking.toFixed(1)}/10
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
