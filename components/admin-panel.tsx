
'use client';

import { useState } from 'react';
import { ArrowLeft, Users, Film, Monitor, Tv, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminUsers } from '@/components/admin/admin-users';
import { AdminMovies } from '@/components/admin/admin-movies';
import { AdminSeries } from '@/components/admin/admin-series';
import { AdminChannels } from '@/components/admin/admin-channels';
import { AdminMessages } from '@/components/admin/admin-messages';
import { motion } from 'framer-motion';

interface AdminPanelProps {
  onBack: () => void;
  onDataChange: () => void;
}

export function AdminPanel({ onBack, onDataChange }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'movies' | 'series' | 'channels' | 'messages'>('users');

  const tabs = [
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'movies', label: 'Películas', icon: Film },
    { id: 'series', label: 'Series', icon: Monitor },
    { id: 'channels', label: 'Canales TV', icon: Tv },
    { id: 'messages', label: 'Mensajes', icon: MessageSquare },
  ] as const;

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
            Panel de Administración
          </h1>
          <p className="netflix-subtitle">
            Gestiona usuarios, contenido y configuraciones de 365GUTY
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 ${
                    activeTab === tab.id
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'users' && <AdminUsers onDataChange={onDataChange} />}
          {activeTab === 'movies' && <AdminMovies onDataChange={onDataChange} />}
          {activeTab === 'series' && <AdminSeries onDataChange={onDataChange} />}
          {activeTab === 'channels' && <AdminChannels onDataChange={onDataChange} />}
          {activeTab === 'messages' && <AdminMessages />}
        </motion.div>
      </div>
    </div>
  );
}
