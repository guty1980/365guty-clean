

'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Star, Monitor, Layers, ChevronRight, Play, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Series, Season, Episode } from '@/lib/types';

interface AdminSeriesProps {
  onDataChange: () => void;
}

type ViewMode = 'series' | 'seasons' | 'episodes';

export function AdminSeries({ onDataChange }: AdminSeriesProps) {
  const [series, setSeries] = useState<Series[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de navegación
  const [viewMode, setViewMode] = useState<ViewMode>('series');
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  
  // Estados de edición
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  
  // Estados de formularios
  const [showCreateSeriesForm, setShowCreateSeriesForm] = useState(false);
  const [showCreateSeasonForm, setShowCreateSeasonForm] = useState(false);
  const [showCreateEpisodeForm, setShowCreateEpisodeForm] = useState(false);
  
  // Datos de formularios
  const [seriesFormData, setSeriesFormData] = useState({
    title: '',
    synopsis: '',
    genre: '',
    year: new Date().getFullYear(),
    ranking: 7.0,
    coverUrl: '',
    videoUrl: '',
    isRecommended: false,
  });

  const [seasonFormData, setSeasonFormData] = useState({
    number: 1,
    title: '',
    year: new Date().getFullYear(),
    description: '',
    coverUrl: '',
  });

  const [episodeFormData, setEpisodeFormData] = useState({
    number: 1,
    title: '',
    synopsis: '',
    duration: 45,
    videoUrl: '',
    thumbnailUrl: '',
    airDate: '',
  });

  useEffect(() => {
    loadSeries();
  }, []);

  // Funciones de carga de datos
  const loadSeries = async () => {
    try {
      const response = await fetch('/api/series');
      const data = await response.json();
      if (data.success) {
        setSeries(data.series);
      }
    } catch (error) {
      console.error('Error cargando series:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSeasons = async (seriesId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/seasons?seriesId=${seriesId}`);
      const data = await response.json();
      if (data.success) {
        setSeasons(data.seasons);
      }
    } catch (error) {
      console.error('Error cargando temporadas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEpisodes = async (seasonId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/episodes?seasonId=${seasonId}`);
      const data = await response.json();
      if (data.success) {
        setEpisodes(data.episodes);
      }
    } catch (error) {
      console.error('Error cargando episodios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funciones de navegación
  const goToSeasons = (series: Series) => {
    setSelectedSeries(series);
    setViewMode('seasons');
    loadSeasons(series.id);
  };

  const goToEpisodes = (season: Season) => {
    setSelectedSeason(season);
    setViewMode('episodes');
    loadEpisodes(season.id);
  };

  const goBackToSeries = () => {
    setViewMode('series');
    setSelectedSeries(null);
    setSelectedSeason(null);
    loadSeries();
  };

  const goBackToSeasons = () => {
    setViewMode('seasons');
    setSelectedSeason(null);
    if (selectedSeries) {
      loadSeasons(selectedSeries.id);
    }
  };

  // Funciones CRUD de Series
  const handleCreateSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seriesFormData),
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateSeriesForm(false);
        resetSeriesForm();
        loadSeries();
        onDataChange();
      }
    } catch (error) {
      console.error('Error creando serie:', error);
    }
  };

  const handleUpdateSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeries) return;

    try {
      const response = await fetch(`/api/series/${editingSeries.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seriesFormData),
      });

      const data = await response.json();
      if (data.success) {
        setEditingSeries(null);
        resetSeriesForm();
        loadSeries();
        onDataChange();
      }
    } catch (error) {
      console.error('Error actualizando serie:', error);
    }
  };

  const handleDeleteSeries = async (seriesId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta serie? Se eliminarán todas las temporadas y episodios.')) return;

    try {
      const response = await fetch(`/api/series/${seriesId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        loadSeries();
        onDataChange();
      }
    } catch (error) {
      console.error('Error eliminando serie:', error);
    }
  };

  // Funciones CRUD de Temporadas
  const handleCreateSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeries) return;

    try {
      const response = await fetch('/api/seasons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...seasonFormData,
          seriesId: selectedSeries.id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateSeasonForm(false);
        resetSeasonForm();
        loadSeasons(selectedSeries.id);
        onDataChange();
      }
    } catch (error) {
      console.error('Error creando temporada:', error);
    }
  };

  const handleUpdateSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeason) return;

    try {
      const response = await fetch(`/api/seasons/${editingSeason.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seasonFormData),
      });

      const data = await response.json();
      if (data.success) {
        setEditingSeason(null);
        resetSeasonForm();
        if (selectedSeries) {
          loadSeasons(selectedSeries.id);
        }
        onDataChange();
      }
    } catch (error) {
      console.error('Error actualizando temporada:', error);
    }
  };

  const handleDeleteSeason = async (seasonId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta temporada? Se eliminarán todos los episodios.')) return;

    try {
      const response = await fetch(`/api/seasons/${seasonId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        if (selectedSeries) {
          loadSeasons(selectedSeries.id);
        }
        onDataChange();
      }
    } catch (error) {
      console.error('Error eliminando temporada:', error);
    }
  };

  // Funciones CRUD de Episodios
  const handleCreateEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeason) return;

    try {
      const response = await fetch('/api/episodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...episodeFormData,
          seasonId: selectedSeason.id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateEpisodeForm(false);
        resetEpisodeForm();
        loadEpisodes(selectedSeason.id);
        onDataChange();
      }
    } catch (error) {
      console.error('Error creando episodio:', error);
    }
  };

  const handleUpdateEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEpisode) return;

    try {
      const response = await fetch(`/api/episodes/${editingEpisode.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(episodeFormData),
      });

      const data = await response.json();
      if (data.success) {
        setEditingEpisode(null);
        resetEpisodeForm();
        if (selectedSeason) {
          loadEpisodes(selectedSeason.id);
        }
        onDataChange();
      }
    } catch (error) {
      console.error('Error actualizando episodio:', error);
    }
  };

  const handleDeleteEpisode = async (episodeId: string) => {
    if (!confirm('¿Estás seguro de eliminar este episodio?')) return;

    try {
      const response = await fetch(`/api/episodes/${episodeId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        if (selectedSeason) {
          loadEpisodes(selectedSeason.id);
        }
        onDataChange();
      }
    } catch (error) {
      console.error('Error eliminando episodio:', error);
    }
  };

  // Funciones de reset de formularios
  const resetSeriesForm = () => {
    setSeriesFormData({
      title: '',
      synopsis: '',
      genre: '',
      year: new Date().getFullYear(),
      ranking: 7.0,
      coverUrl: '',
      videoUrl: '',
      isRecommended: false,
    });
  };

  const resetSeasonForm = () => {
    setSeasonFormData({
      number: 1,
      title: '',
      year: new Date().getFullYear(),
      description: '',
      coverUrl: '',
    });
  };

  const resetEpisodeForm = () => {
    setEpisodeFormData({
      number: 1,
      title: '',
      synopsis: '',
      duration: 45,
      videoUrl: '',
      thumbnailUrl: '',
      airDate: '',
    });
  };

  // Funciones de apertura de formularios de edición
  const openEditSeriesForm = (serie: Series) => {
    setEditingSeries(serie);
    setSeriesFormData({
      title: serie.title,
      synopsis: serie.synopsis,
      genre: serie.genre,
      year: serie.year,
      ranking: serie.ranking,
      coverUrl: serie.coverUrl,
      videoUrl: serie.videoUrl,
      isRecommended: serie.isRecommended,
    });
  };

  const openEditSeasonForm = (season: Season) => {
    setEditingSeason(season);
    setSeasonFormData({
      number: season.number,
      title: season.title,
      year: season.year,
      description: season.description || '',
      coverUrl: season.coverUrl || '',
    });
  };

  const openEditEpisodeForm = (episode: Episode) => {
    setEditingEpisode(episode);
    setEpisodeFormData({
      number: episode.number,
      title: episode.title,
      synopsis: episode.synopsis || '',
      duration: episode.duration,
      videoUrl: episode.videoUrl,
      thumbnailUrl: episode.thumbnailUrl || '',
      airDate: episode.airDate ? episode.airDate.toISOString().split('T')[0] : '',
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">
          {viewMode === 'series' && 'Cargando series...'}
          {viewMode === 'seasons' && 'Cargando temporadas...'}
          {viewMode === 'episodes' && 'Cargando episodios...'}
        </p>
      </div>
    );
  }

  const renderBreadcrumb = () => (
    <div className="flex items-center space-x-2 text-gray-400 text-sm mb-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={goBackToSeries}
        className="text-gray-400 hover:text-white p-0 h-auto"
      >
        Series
      </Button>
      {selectedSeries && (
        <>
          <ChevronRight className="w-4 h-4" />
          <Button
            variant="ghost"
            size="sm"
            onClick={goBackToSeasons}
            className="text-gray-400 hover:text-white p-0 h-auto"
          >
            {selectedSeries.title}
          </Button>
        </>
      )}
      {selectedSeason && (
        <>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">Temporada {selectedSeason.number}</span>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      {viewMode !== 'series' && renderBreadcrumb()}

      {/* Vista de Series */}
      {viewMode === 'series' && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Gestión de Series</h2>
              <p className="text-gray-400">Administra el catálogo de series, temporadas y episodios</p>
            </div>
            
            <Dialog open={showCreateSeriesForm} onOpenChange={setShowCreateSeriesForm}>
              <DialogTrigger asChild>
                <Button className="netflix-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Serie
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white">Agregar Nueva Serie</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateSeries} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Título</Label>
                      <Input
                        value={seriesFormData.title}
                        onChange={(e) => setSeriesFormData({ ...seriesFormData, title: e.target.value })}
                        className="netflix-input"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-white">Género</Label>
                      <Input
                        value={seriesFormData.genre}
                        onChange={(e) => setSeriesFormData({ ...seriesFormData, genre: e.target.value })}
                        className="netflix-input"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-white">Sinopsis</Label>
                    <Textarea
                      value={seriesFormData.synopsis}
                      onChange={(e) => setSeriesFormData({ ...seriesFormData, synopsis: e.target.value })}
                      className="netflix-input h-24"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-white">Año</Label>
                      <Input
                        type="number"
                        value={seriesFormData.year}
                        onChange={(e) => setSeriesFormData({ ...seriesFormData, year: parseInt(e.target.value) })}
                        className="netflix-input"
                        min="1900"
                        max="2030"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-white">Calificación</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={seriesFormData.ranking}
                        onChange={(e) => setSeriesFormData({ ...seriesFormData, ranking: parseFloat(e.target.value) })}
                        className="netflix-input"
                        min="0"
                        max="10"
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        checked={seriesFormData.isRecommended}
                        onCheckedChange={(checked) => setSeriesFormData({ ...seriesFormData, isRecommended: checked })}
                      />
                      <Label className="text-white text-sm">Recomendada</Label>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">URL de Portada</Label>
                    <Input
                      type="url"
                      value={seriesFormData.coverUrl}
                      onChange={(e) => setSeriesFormData({ ...seriesFormData, coverUrl: e.target.value })}
                      className="netflix-input"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-white">URL del Trailer</Label>
                    <Input
                      type="url"
                      value={seriesFormData.videoUrl}
                      onChange={(e) => setSeriesFormData({ ...seriesFormData, videoUrl: e.target.value })}
                      className="netflix-input"
                      required
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button type="submit" className="netflix-button flex-1">
                      Crear Serie
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateSeriesForm(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista de series */}
          <div className="netflix-admin-grid">
            {series.map((serie, index) => (
              <motion.div
                key={serie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-lg overflow-hidden"
              >
                {/* Imagen */}
                <div className="relative h-40 bg-gray-900">
                  <Image
                    src={serie.coverUrl}
                    alt={serie.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {serie.isRecommended && (
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
                    <h3 className="text-white font-semibold text-lg truncate">{serie.title}</h3>
                    <p className="text-gray-400 text-sm">{serie.genre} • {serie.year}</p>
                  </div>

                  <p className="text-gray-300 text-sm line-clamp-2">{serie.synopsis}</p>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center">
                      <Layers className="w-4 h-4 mr-1" />
                      <span>{serie.seasons} temp. • {serie.episodes} ep.</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-500" />
                      <span>{serie.ranking.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => goToSeasons(serie)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Layers className="w-4 h-4 mr-1" />
                      Temporadas
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditSeriesForm(serie)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteSeries(serie.id)}
                    className="w-full text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Eliminar Serie
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Vista de Temporadas */}
      {viewMode === 'seasons' && selectedSeries && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Temporadas de {selectedSeries.title}</h2>
              <p className="text-gray-400">Gestiona las temporadas y sus episodios</p>
            </div>
            
            <Dialog open={showCreateSeasonForm} onOpenChange={setShowCreateSeasonForm}>
              <DialogTrigger asChild>
                <Button className="netflix-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Temporada
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700 max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-white">Agregar Nueva Temporada</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateSeason} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Número</Label>
                      <Input
                        type="number"
                        value={seasonFormData.number}
                        onChange={(e) => setSeasonFormData({ ...seasonFormData, number: parseInt(e.target.value) })}
                        className="netflix-input"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-white">Año</Label>
                      <Input
                        type="number"
                        value={seasonFormData.year}
                        onChange={(e) => setSeasonFormData({ ...seasonFormData, year: parseInt(e.target.value) })}
                        className="netflix-input"
                        min="1900"
                        max="2030"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-white">Título</Label>
                    <Input
                      value={seasonFormData.title}
                      onChange={(e) => setSeasonFormData({ ...seasonFormData, title: e.target.value })}
                      className="netflix-input"
                      placeholder="Ej: Primera Temporada"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-white">Descripción (opcional)</Label>
                    <Textarea
                      value={seasonFormData.description}
                      onChange={(e) => setSeasonFormData({ ...seasonFormData, description: e.target.value })}
                      className="netflix-input h-20"
                      placeholder="Descripción de la temporada..."
                    />
                  </div>

                  <div>
                    <Label className="text-white">URL de Portada (opcional)</Label>
                    <Input
                      type="url"
                      value={seasonFormData.coverUrl}
                      onChange={(e) => setSeasonFormData({ ...seasonFormData, coverUrl: e.target.value })}
                      className="netflix-input"
                      placeholder="URL de imagen específica para esta temporada"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button type="submit" className="netflix-button flex-1">
                      Crear Temporada
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateSeasonForm(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista de temporadas */}
          <div className="netflix-admin-grid">
            {seasons.map((season, index) => (
              <motion.div
                key={season.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-lg overflow-hidden"
              >
                {/* Header de temporada */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-bold text-lg">Temporada {season.number}</h3>
                      <p className="text-red-100 text-sm">{season.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-100 text-sm">{season.year}</p>
                      <p className="text-red-200 text-xs">{season.totalEpisodes} episodios</p>
                    </div>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-4 space-y-3">
                  {season.description && (
                    <p className="text-gray-300 text-sm line-clamp-2">{season.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      onClick={() => goToEpisodes(season)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Episodios
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditSeasonForm(season)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteSeason(season.id)}
                    className="w-full text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Eliminar Temporada
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Vista de Episodios */}
      {viewMode === 'episodes' && selectedSeason && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Episodios - Temporada {selectedSeason.number}
              </h2>
              <p className="text-gray-400">Gestiona los episodios de esta temporada</p>
            </div>
            
            <Dialog open={showCreateEpisodeForm} onOpenChange={setShowCreateEpisodeForm}>
              <DialogTrigger asChild>
                <Button className="netflix-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Episodio
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white">Agregar Nuevo Episodio</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateEpisode} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Número</Label>
                      <Input
                        type="number"
                        value={episodeFormData.number}
                        onChange={(e) => setEpisodeFormData({ ...episodeFormData, number: parseInt(e.target.value) })}
                        className="netflix-input"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-white">Duración (minutos)</Label>
                      <Input
                        type="number"
                        value={episodeFormData.duration}
                        onChange={(e) => setEpisodeFormData({ ...episodeFormData, duration: parseInt(e.target.value) })}
                        className="netflix-input"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-white">Título</Label>
                    <Input
                      value={episodeFormData.title}
                      onChange={(e) => setEpisodeFormData({ ...episodeFormData, title: e.target.value })}
                      className="netflix-input"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-white">Sinopsis (opcional)</Label>
                    <Textarea
                      value={episodeFormData.synopsis}
                      onChange={(e) => setEpisodeFormData({ ...episodeFormData, synopsis: e.target.value })}
                      className="netflix-input h-24"
                      placeholder="Descripción del episodio..."
                    />
                  </div>

                  <div>
                    <Label className="text-white">URL del Video</Label>
                    <Input
                      type="url"
                      value={episodeFormData.videoUrl}
                      onChange={(e) => setEpisodeFormData({ ...episodeFormData, videoUrl: e.target.value })}
                      className="netflix-input"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-white">URL de Miniatura (opcional)</Label>
                    <Input
                      type="url"
                      value={episodeFormData.thumbnailUrl}
                      onChange={(e) => setEpisodeFormData({ ...episodeFormData, thumbnailUrl: e.target.value })}
                      className="netflix-input"
                      placeholder="URL de imagen del episodio"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Fecha de emisión (opcional)</Label>
                    <Input
                      type="date"
                      value={episodeFormData.airDate}
                      onChange={(e) => setEpisodeFormData({ ...episodeFormData, airDate: e.target.value })}
                      className="netflix-input"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button type="submit" className="netflix-button flex-1">
                      Crear Episodio
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateEpisodeForm(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista de episodios */}
          <div className="space-y-4">
            {episodes.map((episode, index) => (
              <motion.div
                key={episode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-lg p-4 flex items-center space-x-4"
              >
                {/* Número del episodio */}
                <div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{episode.number}</span>
                </div>

                {/* Información del episodio */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">{episode.title}</h3>
                  {episode.synopsis && (
                    <p className="text-gray-400 text-sm line-clamp-2 mt-1">{episode.synopsis}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{episode.duration} min</span>
                    </div>
                    {episode.airDate && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(episode.airDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex-shrink-0 space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditEpisodeForm(episode)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteEpisode(episode.id)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Dialog de edición de serie */}
      <Dialog open={!!editingSeries} onOpenChange={() => setEditingSeries(null)}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Serie</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSeries} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Título</Label>
                <Input
                  value={seriesFormData.title}
                  onChange={(e) => setSeriesFormData({ ...seriesFormData, title: e.target.value })}
                  className="netflix-input"
                  required
                />
              </div>
              <div>
                <Label className="text-white">Género</Label>
                <Input
                  value={seriesFormData.genre}
                  onChange={(e) => setSeriesFormData({ ...seriesFormData, genre: e.target.value })}
                  className="netflix-input"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label className="text-white">Sinopsis</Label>
              <Textarea
                value={seriesFormData.synopsis}
                onChange={(e) => setSeriesFormData({ ...seriesFormData, synopsis: e.target.value })}
                className="netflix-input h-24"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-white">Año</Label>
                <Input
                  type="number"
                  value={seriesFormData.year}
                  onChange={(e) => setSeriesFormData({ ...seriesFormData, year: parseInt(e.target.value) })}
                  className="netflix-input"
                  min="1900"
                  max="2030"
                  required
                />
              </div>
              <div>
                <Label className="text-white">Calificación</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={seriesFormData.ranking}
                  onChange={(e) => setSeriesFormData({ ...seriesFormData, ranking: parseFloat(e.target.value) })}
                  className="netflix-input"
                  min="0"
                  max="10"
                  required
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  checked={seriesFormData.isRecommended}
                  onCheckedChange={(checked) => setSeriesFormData({ ...seriesFormData, isRecommended: checked })}
                />
                <Label className="text-white text-sm">Recomendada</Label>
              </div>
            </div>

            <div>
              <Label className="text-white">URL de Portada</Label>
              <Input
                type="url"
                value={seriesFormData.coverUrl}
                onChange={(e) => setSeriesFormData({ ...seriesFormData, coverUrl: e.target.value })}
                className="netflix-input"
                required
              />
            </div>

            <div>
              <Label className="text-white">URL del Trailer</Label>
              <Input
                type="url"
                value={seriesFormData.videoUrl}
                onChange={(e) => setSeriesFormData({ ...seriesFormData, videoUrl: e.target.value })}
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
                onClick={() => setEditingSeries(null)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de edición de temporada */}
      <Dialog open={!!editingSeason} onOpenChange={() => setEditingSeason(null)}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Temporada</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSeason} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Número</Label>
                <Input
                  type="number"
                  value={seasonFormData.number}
                  onChange={(e) => setSeasonFormData({ ...seasonFormData, number: parseInt(e.target.value) })}
                  className="netflix-input"
                  min="1"
                  required
                />
              </div>
              <div>
                <Label className="text-white">Año</Label>
                <Input
                  type="number"
                  value={seasonFormData.year}
                  onChange={(e) => setSeasonFormData({ ...seasonFormData, year: parseInt(e.target.value) })}
                  className="netflix-input"
                  min="1900"
                  max="2030"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label className="text-white">Título</Label>
              <Input
                value={seasonFormData.title}
                onChange={(e) => setSeasonFormData({ ...seasonFormData, title: e.target.value })}
                className="netflix-input"
                required
              />
            </div>

            <div>
              <Label className="text-white">Descripción (opcional)</Label>
              <Textarea
                value={seasonFormData.description}
                onChange={(e) => setSeasonFormData({ ...seasonFormData, description: e.target.value })}
                className="netflix-input h-20"
              />
            </div>

            <div>
              <Label className="text-white">URL de Portada (opcional)</Label>
              <Input
                type="url"
                value={seasonFormData.coverUrl}
                onChange={(e) => setSeasonFormData({ ...seasonFormData, coverUrl: e.target.value })}
                className="netflix-input"
              />
            </div>

            <div className="flex space-x-2">
              <Button type="submit" className="netflix-button flex-1">
                Guardar Cambios
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingSeason(null)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de edición de episodio */}
      <Dialog open={!!editingEpisode} onOpenChange={() => setEditingEpisode(null)}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Episodio</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateEpisode} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Número</Label>
                <Input
                  type="number"
                  value={episodeFormData.number}
                  onChange={(e) => setEpisodeFormData({ ...episodeFormData, number: parseInt(e.target.value) })}
                  className="netflix-input"
                  min="1"
                  required
                />
              </div>
              <div>
                <Label className="text-white">Duración (minutos)</Label>
                <Input
                  type="number"
                  value={episodeFormData.duration}
                  onChange={(e) => setEpisodeFormData({ ...episodeFormData, duration: parseInt(e.target.value) })}
                  className="netflix-input"
                  min="1"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label className="text-white">Título</Label>
              <Input
                value={episodeFormData.title}
                onChange={(e) => setEpisodeFormData({ ...episodeFormData, title: e.target.value })}
                className="netflix-input"
                required
              />
            </div>

            <div>
              <Label className="text-white">Sinopsis (opcional)</Label>
              <Textarea
                value={episodeFormData.synopsis}
                onChange={(e) => setEpisodeFormData({ ...episodeFormData, synopsis: e.target.value })}
                className="netflix-input h-24"
              />
            </div>

            <div>
              <Label className="text-white">URL del Video</Label>
              <Input
                type="url"
                value={episodeFormData.videoUrl}
                onChange={(e) => setEpisodeFormData({ ...episodeFormData, videoUrl: e.target.value })}
                className="netflix-input"
                required
              />
            </div>

            <div>
              <Label className="text-white">URL de Miniatura (opcional)</Label>
              <Input
                type="url"
                value={episodeFormData.thumbnailUrl}
                onChange={(e) => setEpisodeFormData({ ...episodeFormData, thumbnailUrl: e.target.value })}
                className="netflix-input"
              />
            </div>

            <div>
              <Label className="text-white">Fecha de emisión (opcional)</Label>
              <Input
                type="date"
                value={episodeFormData.airDate}
                onChange={(e) => setEpisodeFormData({ ...episodeFormData, airDate: e.target.value })}
                className="netflix-input"
              />
            </div>

            <div className="flex space-x-2">
              <Button type="submit" className="netflix-button flex-1">
                Guardar Cambios
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingEpisode(null)}
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
