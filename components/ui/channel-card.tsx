
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Channel } from '@/lib/types';

interface ChannelCardProps {
  channel: Channel;
  onPlay: (channel: Channel) => void;
  className?: string;
}

export function ChannelCard({ channel, onPlay, className = "" }: ChannelCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPlay(channel);
    }
  };

  return (
    <motion.div
      className={`relative group cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo del canal */}
      <div className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
        {!imageError ? (
          <Image
            src={channel.coverUrl}
            alt={channel.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Tv className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm font-medium">{channel.name}</p>
            </div>
          </div>
        )}

        {/* Overlay con información */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-bold text-sm mb-3 text-center">
              {channel.name}
            </h3>
            
            {/* Botón de reproducción */}
            <div className="flex justify-center">
              <Button
                size="sm"
                className="bg-white text-black hover:bg-gray-200 px-4 py-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay(channel);
                }}
              >
                <Play className="w-4 h-4 mr-2" />
                Ver Canal
              </Button>
            </div>
          </div>
        </div>

        {/* Indicador de transmisión en vivo */}
        <div className="absolute top-2 right-2">
          <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center">
            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
            EN VIVO
          </div>
        </div>
      </div>

      {/* Focus ring para navegación con teclado */}
      <div className={`absolute inset-0 rounded-lg ring-2 ring-red-500 transition-opacity duration-200 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`} />
    </motion.div>
  );
}
