
'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import Image from 'next/image';

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
  createdAt: string;
}

interface AdminMoviesProps {
  onDataChange: () => void;
}

export function AdminMovies({ onDataChange }: AdminMoviesProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    synopsis: '',
    genre: '',
    year: new Date().getFullYear(),
    duration: 120,
    ranking: 7.0,
    coverUrl: '',
    videoUrl: '',
    isRecommended: false,
  });

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      const response = await fetch('/api/movies');
      const data = await response.json();
      if (data.success) {
        setMovies(data.movies);
      }
    } catch (error) {
      console.error('Error cargando películas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateForm(false);
        resetForm();
        loadMovies();
        onDataChange();
      }
    } catch (error) {
      console.error('Error creando película:', error);
    }
  };

  const handleUpdateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovie) return;

    try {
      const response = await fetch(`/api/movies/${editingMovie.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setEditingMovie(null);
        resetForm();
        loadMovies();
        onDataChange();
      }
    } catch (error) {
      console.error('Error actualizando película:', error);
    }
  };

  const handleDeleteMovie = async (movieId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta película?')) return;

    try {
      const response = await fetch(`/api/movies/${movieId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        loadMovies();
        onDataChange();
      }
    } catch (error) {
      console.error('Error eliminando película:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      synopsis: '',
      genre: '',
      year: new Date().getFullYear(),
      duration: 120,
      ranking: 7.0,
      coverUrl: '',
      videoUrl: '',
      isRecommended: false,
    });
  };

  const openEditForm = (movie: Movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      synopsis: movie.synopsis,
      genre: movie.genre,
      year: movie.year,
      duration: movie.duration,
      ranking: movie.ranking,
      coverUrl: movie.coverUrl,
      videoUrl: movie.videoUrl,
      isRecommended: movie.isRecommended,
    });
  };

  // Manejar teclas de escape para cerrar modales
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (editingMovie) {
        setEditingMovie(null);
      } else if (showCreateForm) {
        setShowCreateForm(false);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingMovie, showCreateForm]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Cargando películas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestión de Películas</h2>
          <p className="text-gray-400">Administra el catálogo de películas y contenido</p>
        </div>
        
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button className="netflix-button">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Película
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Agregar Nueva Película</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateMovie} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Título</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="netflix-input"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white">Género</Label>
                  <Input
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="netflix-input"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-white">Sinopsis</Label>
                <Textarea
                  value={formData.synopsis}
                  onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                  className="netflix-input h-24"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Año</Label>
                  <Input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="netflix-input"
                    min="1900"
                    max="2030"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white">Duración (min)</Label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="netflix-input"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white">Calificación</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.ranking}
                    onChange={(e) => setFormData({ ...formData, ranking: parseFloat(e.target.value) })}
                    className="netflix-input"
                    min="0"
                    max="10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-white">URL de Portada (500x720px)</Label>
                <Input
                  type="url"
                  value={formData.coverUrl}
                  onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                  className="netflix-input"
                  required
                />
              </div>

              <div>
                <Label className="text-white">URL del Video (directo o M3U8)</Label>
                <Input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="netflix-input"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isRecommended}
                  onCheckedChange={(checked) => setFormData({ ...formData, isRecommended: checked })}
                />
                <Label className="text-white">Película Recomendada (aparece en carrusel principal)</Label>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="netflix-button flex-1">
                  Crear Película
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

      {/* Lista de películas */}
      <div className="netflix-admin-grid">
        {movies.map((movie, index) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-lg overflow-hidden"
          >
            {/* Imagen */}
            <div className="relative h-40 bg-gray-900">
              <Image
                src={movie.coverUrl}
                alt={movie.title}
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {movie.isRecommended && (
                <div className="absolute top-2 left-2">
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                    RECOMENDADO
                  </span>
                </div>
              )}
            </div>

            {/* Contenido */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-white font-semibold text-lg truncate">{movie.title}</h3>
                <p className="text-gray-400 text-sm">{movie.genre} • {movie.year}</p>
              </div>

              <p className="text-gray-300 text-sm line-clamp-2">{movie.synopsis}</p>

              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  <span>{movie.ranking.toFixed(1)}</span>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditForm(movie)}
                  className="flex-1 text-gray-400 hover:text-white"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteMovie(movie.id)}
                  className="text-gray-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dialog de edición */}
      <Dialog open={!!editingMovie} onOpenChange={() => setEditingMovie(null)}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Película</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateMovie} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Título</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="netflix-input"
                  required
                />
              </div>
              <div>
                <Label className="text-white">Género</Label>
                <Input
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  className="netflix-input"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label className="text-white">Sinopsis</Label>
              <Textarea
                value={formData.synopsis}
                onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                className="netflix-input h-24"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-white">Año</Label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="netflix-input"
                  min="1900"
                  max="2030"
                  required
                />
              </div>
              <div>
                <Label className="text-white">Duración (min)</Label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="netflix-input"
                  min="1"
                  required
                />
              </div>
              <div>
                <Label className="text-white">Calificación</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.ranking}
                  onChange={(e) => setFormData({ ...formData, ranking: parseFloat(e.target.value) })}
                  className="netflix-input"
                  min="0"
                  max="10"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-white">URL de Portada (500x720px)</Label>
              <Input
                type="url"
                value={formData.coverUrl}
                onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                className="netflix-input"
                required
              />
            </div>

            <div>
              <Label className="text-white">URL del Video (directo o M3U8)</Label>
              <Input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="netflix-input"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isRecommended}
                onCheckedChange={(checked) => setFormData({ ...formData, isRecommended: checked })}
              />
              <Label className="text-white">Película Recomendada (aparece en carrusel principal)</Label>
            </div>

            <div className="flex space-x-2">
              <Button type="submit" className="netflix-button flex-1">
                Guardar Cambios
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingMovie(null)}
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
