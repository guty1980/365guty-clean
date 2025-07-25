
'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Channel {
  id: string;
  name: string;
  coverUrl: string;
  m3u8Url: string;
  createdAt: string;
}

interface AdminChannelsProps {
  onDataChange: () => void;
}

export function AdminChannels({ onDataChange }: AdminChannelsProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    coverUrl: '',
    m3u8Url: '',
  });

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      const response = await fetch('/api/channels');
      const data = await response.json();
      if (data.success) {
        setChannels(data.channels);
      }
    } catch (error) {
      console.error('Error cargando canales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateForm(false);
        resetForm();
        loadChannels();
        onDataChange();
      }
    } catch (error) {
      console.error('Error creando canal:', error);
    }
  };

  const handleUpdateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChannel) return;

    try {
      const response = await fetch(`/api/channels/${editingChannel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setEditingChannel(null);
        resetForm();
        loadChannels();
        onDataChange();
      }
    } catch (error) {
      console.error('Error actualizando canal:', error);
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    if (!confirm('¿Estás seguro de eliminar este canal?')) return;

    try {
      const response = await fetch(`/api/channels/${channelId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        loadChannels();
        onDataChange();
      }
    } catch (error) {
      console.error('Error eliminando canal:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      coverUrl: '',
      m3u8Url: '',
    });
  };

  const openEditForm = (channel: Channel) => {
    setEditingChannel(channel);
    setFormData({
      name: channel.name,
      coverUrl: channel.coverUrl,
      m3u8Url: channel.m3u8Url,
    });
  };

  // Manejar teclas de escape para cerrar modales
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (editingChannel) {
        setEditingChannel(null);
      } else if (showCreateForm) {
        setShowCreateForm(false);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingChannel, showCreateForm]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Cargando canales...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestión de Canales TV</h2>
          <p className="text-gray-400">Administra los canales de televisión en vivo</p>
        </div>
        
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button className="netflix-button">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Canal
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Agregar Nuevo Canal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateChannel} className="space-y-4">
              <div>
                <Label className="text-white">Nombre del Canal</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="netflix-input"
                  placeholder="Ej: Canal Deportes"
                  required
                />
              </div>

              <div>
                <Label className="text-white">URL de la Portada/Logo</Label>
                <Input
                  type="url"
                  value={formData.coverUrl}
                  onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                  className="netflix-input"
                  placeholder="https://i.pinimg.com/originals/c3/51/84/c351844f3be5fa5df32375cd320e6894.jpg"
                  required
                />
              </div>

              <div>
                <Label className="text-white">URL M3U8 del Canal</Label>
                <Input
                  type="url"
                  value={formData.m3u8Url}
                  onChange={(e) => setFormData({ ...formData, m3u8Url: e.target.value })}
                  className="netflix-input"
                  placeholder="https://ejemplo.com/canal.m3u8"
                  required
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="netflix-button flex-1">
                  Crear Canal
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de canales */}
      <div className="netflix-admin-grid">
        {channels.map((channel, index) => (
          <motion.div
            key={channel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-lg overflow-hidden"
          >
            {/* Logo del canal */}
            <div className="relative h-32 bg-gray-900 flex items-center justify-center">
              <Image
                src={channel.coverUrl}
                alt={channel.name}
                width={120}
                height={120}
                className="object-contain max-h-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {/* Indicador de transmisión en vivo */}
              <div className="absolute top-2 right-2">
                <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                  EN VIVO
                </div>
              </div>
            </div>

            {/* Información del canal */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-white font-semibold text-lg">{channel.name}</h3>
                <p className="text-gray-400 text-sm">
                  Creado: {new Date(channel.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">M3U8 URL:</span>
                  <p className="text-gray-300 truncate" title={channel.m3u8Url}>
                    {channel.m3u8Url}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditForm(channel)}
                  className="flex-1 text-gray-400 hover:text-white"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteChannel(channel.id)}
                  className="text-gray-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {channels.length === 0 && !loading && (
        <div className="text-center py-16">
          <Tv className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No hay canales configurados
          </h3>
          <p className="text-gray-400 mb-4">
            Agrega canales de TV para que los usuarios puedan disfrutar de contenido en vivo
          </p>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="netflix-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Primer Canal
          </Button>
        </div>
      )}

      {/* Dialog de edición */}
      <Dialog open={!!editingChannel} onOpenChange={() => setEditingChannel(null)}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Canal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateChannel} className="space-y-4">
            <div>
              <Label className="text-white">Nombre del Canal</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="netflix-input"
                required
              />
            </div>

            <div>
              <Label className="text-white">URL de la Portada/Logo</Label>
              <Input
                type="url"
                value={formData.coverUrl}
                onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                className="netflix-input"
                required
              />
            </div>

            <div>
              <Label className="text-white">URL M3U8 del Canal</Label>
              <Input
                type="url"
                value={formData.m3u8Url}
                onChange={(e) => setFormData({ ...formData, m3u8Url: e.target.value })}
                className="netflix-input"
                required
              />
            </div>

            <div className="flex space-x-2">
              <Button type="submit" className="netflix-button flex-1">
                Guardar Cambios
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingChannel(null)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
