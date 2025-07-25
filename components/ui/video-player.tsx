
'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, ArrowLeft, SkipBack, SkipForward, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { motion, AnimatePresence } from 'framer-motion';

// Importar HLS.js dinámicamente para evitar errores de SSR
let Hls: any = null;
if (typeof window !== 'undefined') {
  import('hls.js').then((hlsModule) => {
    Hls = hlsModule.default;
  });
}

interface VideoPlayerProps {
  src: string;
  title: string;
  onClose: () => void;
  autoPlay?: boolean;
}

export function VideoPlayer({ src, title, onClose, autoPlay = true }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Detectar si la URL es un stream M3U8
  const isHLSSource = (url: string) => {
    return url.includes('.m3u8') || url.includes('m3u8');
  };

  // Función para intentar reproducir el video
  const attemptPlayVideo = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      setError(null);
      setIsLoading(true);

      if (autoPlay) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      }
    } catch (playError) {
      console.error('Error al reproducir video:', playError);
      setError('Error al reproducir el video. Intenta nuevamente.');
    }
  };

  // Función para cargar video con HLS
  const loadHLSVideo = () => {
    const video = videoRef.current;
    if (!video || !Hls) return;

    if (Hls.isSupported()) {
      // Limpiar instancia anterior de HLS
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        attemptPlayVideo();
      });

      hls.on(Hls.Events.ERROR, (event: any, data: any) => {
        if (data.fatal) {
          switch(data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Error de red fatal, intentando recuperar...');
              if (retryCount < 3) {
                setRetryCount(prev => prev + 1);
                setTimeout(() => hls.startLoad(), 1000);
              } else {
                setError('Error de conexión. Verifica tu internet e intenta nuevamente.');
                setIsLoading(false);
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Error de medios fatal, intentando recuperar...');
              hls.recoverMediaError();
              break;
            default:
              setError('Error al cargar el video. La fuente puede no estar disponible.');
              setIsLoading(false);
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Soporte nativo para HLS en Safari
      video.src = src;
      setIsLoading(false);
      attemptPlayVideo();
    } else {
      setError('Tu navegador no soporta este formato de video.');
      setIsLoading(false);
    }
  };

  // Función para cargar video directo
  const loadDirectVideo = () => {
    const video = videoRef.current;
    if (!video) return;

    video.src = src;
    setIsLoading(false);
    attemptPlayVideo();
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    const handleError = () => {
      setIsLoading(false);
      setError('Error al cargar el video. La fuente puede no estar disponible.');
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);

    // Cargar el video según el tipo de fuente
    const initializeVideo = async () => {
      // Esperar a que HLS.js se cargue si es necesario
      if (isHLSSource(src) && !Hls) {
        // Esperar un poco para que HLS.js se cargue
        setTimeout(initializeVideo, 100);
        return;
      }

      if (isHLSSource(src)) {
        loadHLSVideo();
      } else {
        loadDirectVideo();
      }
    };

    initializeVideo();

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);

      // Limpiar HLS al desmontar
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoPlay]);

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0];
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = value[0];
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const retryVideo = () => {
    setError(null);
    setRetryCount(0);
    setIsLoading(true);
    
    // Limpiar HLS si existe
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Reinicializar el video
    if (isHLSSource(src)) {
      loadHLSVideo();
    } else {
      loadDirectVideo();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Si hay un error y presionan 'r', reintentar
    if (error && (e.key === 'r' || e.key === 'R')) {
      e.preventDefault();
      retryVideo();
      return;
    }

    switch (e.key) {
      case ' ':
        e.preventDefault();
        if (!error) togglePlay();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (!error) skipTime(-10);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (!error) skipTime(10);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!error) handleVolumeChange([Math.min(1, volume + 0.1)]);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!error) handleVolumeChange([Math.max(0, volume - 0.1)]);
        break;
      case 'm':
      case 'M':
        if (!error) toggleMute();
        break;
      case 'f':
      case 'F':
        if (!error) toggleFullscreen();
        break;
      case 'Escape':
        if (isFullscreen) {
          toggleFullscreen();
        } else {
          onClose();
        }
        break;
    }
    if (!error) showControlsTemporarily();
  };

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      onMouseMove={showControlsTemporarily}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onClick={!error ? togglePlay : undefined}
        playsInline
        controlsList="nodownload"
      />

      {/* Loading */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center text-white">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg">Cargando video...</p>
            {retryCount > 0 && (
              <p className="text-sm text-gray-300 mt-2">
                Reintento {retryCount}/3...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-black/80"
        >
          <div className="text-center text-white max-w-md mx-4">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Error de Reproducción</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {error}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={retryVideo}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3"
              >
                <Play className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/20 px-6 py-3"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              Presiona <kbd className="bg-gray-700 px-2 py-1 rounded text-xs">R</kbd> para reintentar
            </p>
          </div>
        </motion.div>
      )}

      {/* Controles */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-6 pointer-events-auto">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 focus:bg-white/30 focus:ring-2 focus:ring-white/50 px-4 py-2"
                  autoFocus
                >
                  <ArrowLeft className="w-6 h-6 mr-2" />
                  Volver
                </Button>
                <h1 className="text-white text-xl font-semibold flex items-center">
                  <span className="truncate">{title}</span>
                </h1>
              </div>
            </div>

            {/* Controles de reproducción */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pointer-events-auto">
              {/* Barra de progreso */}
              <div className="mb-4">
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={1}
                  onValueChange={handleSeek}
                  className="w-full"
                />
                <div className="flex justify-between text-white text-sm mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controles principales */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Botón play/pause */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlay}
                    className="text-white hover:bg-white/20 w-12 h-12"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8" />
                    )}
                  </Button>

                  {/* Skip buttons */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => skipTime(-10)}
                    className="text-white hover:bg-white/20"
                  >
                    <SkipBack className="w-6 h-6" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => skipTime(10)}
                    className="text-white hover:bg-white/20"
                  >
                    <SkipForward className="w-6 h-6" />
                  </Button>

                  {/* Volumen */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-6 h-6" />
                      ) : (
                        <Volume2 className="w-6 h-6" />
                      )}
                    </Button>
                    <div className="w-24">
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        max={1}
                        step={0.1}
                        onValueChange={handleVolumeChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Pantalla completa */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay de pausa en el centro */}
      {!isPlaying && !isLoading && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="bg-black/50 rounded-full p-6">
            <Play className="w-16 h-16 text-white" />
          </div>
        </motion.div>
      )}
    </div>
  );
}
