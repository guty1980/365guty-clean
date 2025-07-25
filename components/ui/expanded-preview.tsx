
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, Star, Clock, Calendar, Monitor, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Movie, Series } from '@/lib/types';

interface ExpandedPreviewProps {
  content: Movie | Series;
  isVisible: boolean;
  onPlay: (content: Movie | Series) => void;
  position: { x: number; y: number };
  className?: string;
}

const isMovie = (content: Movie | Series): content is Movie => {
  return 'duration' in content;
};

export function ExpandedPreview({ 
  content, 
  isVisible, 
  onPlay, 
  position, 
  className = "" 
}: ExpandedPreviewProps) {
  const [imageError, setImageError] = useState(false);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPlay(content);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ 
            duration: 0.3, 
            ease: [0.04, 0.62, 0.23, 0.98] 
          }}
          className={`absolute z-50 w-80 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden ${className}`}
          style={{
            left: position.x,
            top: position.y,
          }}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Imagen de portada */}
          <div className="relative h-44 bg-gray-800">
            {!imageError ? (
              <Image
                src={content.coverUrl}
                alt={content.title}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                {isMovie(content) ? (
                  <Play className="w-12 h-12 text-gray-400" />
                ) : (
                  <Monitor className="w-12 h-12 text-gray-400" />
                )}
              </div>
            )}
            
            {/* Overlay gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
            
            {/* Botón de reproducir prominente */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                onClick={handlePlay}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 text-lg font-bold shadow-xl transform hover:scale-105 transition-transform"
              >
                <Play className="w-6 h-6 mr-2" />
                Reproducir
              </Button>
            </div>

            {/* Indicador de recomendado */}
            {content.isRecommended && (
              <div className="absolute top-3 left-3">
                <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                  RECOMENDADO
                </div>
              </div>
            )}
          </div>

          {/* Información detallada */}
          <div className="p-4">
            {/* Título y rating */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-white font-bold text-lg leading-tight flex-1 mr-2">
                {content.title}
              </h3>
              <div className="flex items-center text-yellow-500 flex-shrink-0">
                <Star className="w-4 h-4 mr-1" />
                <span className="text-white font-semibold text-sm">
                  {content.ranking.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Metadatos */}
            <div className="flex items-center space-x-3 text-xs text-gray-300 mb-3">
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                <span>{content.year}</span>
              </div>
              
              {isMovie(content) ? (
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{Math.floor(content.duration / 60)}h {content.duration % 60}m</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center">
                    <Layers className="w-3 h-3 mr-1" />
                    <span>{content.seasons} temp.</span>
                  </div>
                  <div className="flex items-center">
                    <Monitor className="w-3 h-3 mr-1" />
                    <span>{content.episodes} ep.</span>
                  </div>
                </>
              )}
              
              <span className="bg-gray-700 px-2 py-0.5 rounded text-xs">
                {content.genre}
              </span>
            </div>

            {/* Sinopsis completa */}
            <div className="mb-4">
              <h4 className="text-white font-semibold text-sm mb-2">Sinopsis</h4>
              <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">
                {content.synopsis}
              </p>
            </div>

            {/* Información adicional en grid */}
            <div className="border-t border-gray-700 pt-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">Género:</span>
                  <p className="text-white font-medium">{content.genre}</p>
                </div>
                <div>
                  <span className="text-gray-400">Año:</span>
                  <p className="text-white font-medium">{content.year}</p>
                </div>
                {isMovie(content) ? (
                  <div>
                    <span className="text-gray-400">Duración:</span>
                    <p className="text-white font-medium">
                      {Math.floor(content.duration / 60)}h {content.duration % 60}m
                    </p>
                  </div>
                ) : (
                  <div>
                    <span className="text-gray-400">Episodios:</span>
                    <p className="text-white font-medium">{content.episodes} episodios</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-400">Rating:</span>
                  <p className="text-white font-medium">{content.ranking.toFixed(1)}/10</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
