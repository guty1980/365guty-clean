
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Play, Star, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Movie, Series } from '@/lib/types';
import { ExpandedPreview } from './expanded-preview';

interface SeriesCardProps {
  series: Series;
  onPlay: (series: Series) => void;
  className?: string;
}

export function SeriesCard({ series, onPlay, className = "" }: SeriesCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      calculatePreviewPosition();
      setShowPreview(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowPreview(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleFocus = () => {
    setIsHovered(true);
    calculatePreviewPosition();
    setShowPreview(true);
  };

  const handleBlur = () => {
    setIsHovered(false);
    setShowPreview(false);
  };

  const calculatePreviewPosition = () => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const previewWidth = 320; // 80 * 4 = 320px (w-80)
    const previewHeight = 400; // Aproximadamente
    
    let x = rect.right + 10; // 10px de margen
    let y = rect.top;
    
    // Verificar si se sale por la derecha
    if (x + previewWidth > window.innerWidth) {
      x = rect.left - previewWidth - 10;
    }
    
    // Verificar si se sale por abajo
    if (y + previewHeight > window.innerHeight) {
      y = window.innerHeight - previewHeight - 10;
    }
    
    // Verificar si se sale por arriba
    if (y < 10) {
      y = 10;
    }
    
    setPreviewPosition({ x, y });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPlay(series);
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Wrapper function para ExpandedPreview
  const handlePreviewPlay = (content: Movie | Series) => {
    // Como sabemos que este es un SeriesCard, content siempre será Series
    onPlay(content as Series);
  };

  return (
    <>
      <motion.div
        ref={cardRef}
        className={`relative group cursor-pointer ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        whileHover={{ scale: showPreview ? 1 : 1.05 }}
        transition={{ duration: 0.3 }}
        onClick={() => onPlay(series)}
      >
        {/* Imagen de portada */}
        <div className="relative aspect-[5/7] bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
          {!imageError ? (
            <Image
              src={series.coverUrl}
              alt={series.title}
              fill
              className="object-cover transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Monitor className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm font-medium">{series.title}</p>
              </div>
            </div>
          )}

          {/* Overlay simple con título */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
            isHovered && !showPreview ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="text-white font-bold text-sm text-center">
                {series.title}
              </h3>
              <div className="flex items-center justify-center space-x-1 text-xs text-gray-300 mt-1">
                <span>{series.year}</span>
                <span>•</span>
                <div className="flex items-center">
                  <Star className="w-3 h-3 text-yellow-500 mr-1" />
                  <span>{series.ranking.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Indicador de recomendado */}
          {series.isRecommended && (
            <div className="absolute top-2 left-2">
              <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                RECOMENDADO
              </div>
            </div>
          )}
        </div>

        {/* Focus ring para navegación con teclado */}
        <div className={`absolute inset-0 rounded-lg ring-2 ring-red-500 transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />
      </motion.div>

      {/* Miniatura expandida */}
      <ExpandedPreview
        content={series}
        isVisible={showPreview}
        onPlay={handlePreviewPlay}
        position={previewPosition}
      />
    </>
  );
}
