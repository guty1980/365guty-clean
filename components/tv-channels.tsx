
'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChannelCard } from '@/components/ui/channel-card';
import { motion } from 'framer-motion';
import { Channel } from '@/lib/types';

interface TVChannelsProps {
  channels: Channel[];
  onBack: () => void;
  onPlayChannel: (channel: Channel) => void;
}

export function TVChannels({ channels, onBack, onPlayChannel }: TVChannelsProps) {
  return (
    <div className="min-h-screen bg-black pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-400 hover:text-white mb-4 p-0"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al inicio
          </Button>
          
          <h1 className="netflix-title mb-4">
            Canales de TV
          </h1>
          <p className="netflix-subtitle">
            Disfruta de transmisión en vivo las 24 horas
          </p>
        </motion.div>

        {/* Grid de canales */}
        {channels.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="netflix-grid"
          >
            {channels.map((channel, index) => (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <ChannelCard
                  channel={channel}
                  onPlay={onPlayChannel}
                  className="netflix-card tv-focusable"
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No hay canales disponibles
            </h3>
            <p className="text-gray-400">
              Los canales de TV aparecerán aquí cuando estén configurados
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
