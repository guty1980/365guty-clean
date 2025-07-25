
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🎯 HandleSubmit llamado', { password: password.length, isLoading });
    e.preventDefault();
    if (!password.trim()) {
      console.log('❌ Password vacío, retornando');
      return;
    }

    console.log('🚀 Iniciando login...');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      console.log('📝 Respuesta de la API:', data);

      if (data.success) {
        console.log('✅ Login exitoso, redirigiendo...');
        // Mostrar mensaje de bienvenida
        const welcomeMessage = data.user.isAdmin 
          ? `Bienvenido Administrador` 
          : `Bienvenido ${data.user.name}`;
        
        console.log(welcomeMessage);
        
        // Esperar un momento para que se establezca la cookie
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      } else {
        console.log('❌ Login falló:', data.error);
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('❌ Error de red:', error);
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      console.log('⌨️ Enter presionado');
      // Crear un evento sintético para el submit
      const syntheticEvent = {
        preventDefault: () => {}
      } as React.FormEvent;
      handleSubmit(syntheticEvent);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Video de fondo */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-br from-red-900/20 via-black to-black" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIgLz4KPC9zdmc+')] opacity-30" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-8 shadow-2xl border border-white/10">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-red-600 mb-4 flex items-center justify-center">
              <Play className="w-10 h-10 mr-2" />
              365GUTY
            </h1>
            <p className="text-gray-400 text-lg">
              Tu plataforma de entretenimiento
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-white text-sm font-medium block">
                Contraseña de acceso
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ingresa tu contraseña"
                  className="netflix-input pr-12 text-lg py-3"
                  disabled={isLoading}
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="bg-red-600/20 border border-red-600/50 rounded-md p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full netflix-button text-lg py-3"
              disabled={isLoading || !password.trim()}
              onClick={(e) => {
                console.log('🖱️ Botón Acceder clickeado', { 
                  disabled: isLoading || !password.trim(),
                  password: password.length,
                  isLoading 
                });
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Verificando...
                </div>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Acceder
                </>
              )}
            </Button>
          </form>

          {/* Información adicional */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="text-center text-gray-400 text-sm">
              <p className="mb-2">Optimizado para Android TV</p>
              <p className="text-xs">
                Usa las teclas direccionales del control remoto para navegar
              </p>
            </div>
          </div>
        </div>

        {/* Instrucciones de navegación */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Presiona Enter para acceder • Escribe tu contraseña y navega con el control remoto</p>
        </div>
      </div>
    </div>
  );
}
