
'use client';

import { useState } from 'react';
import { Search, User, LogOut, Settings, Tv, Film, Monitor, MessageCircle } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NetflixHeaderProps {
  onSearch?: (query: string) => void;
  onShowAdmin?: () => void;
  onShowTV?: () => void;
  onShowMovies?: () => void;
  onShowSeries?: () => void;
  onShowChat?: () => void;
  currentView?: string;
}

export function NetflixHeader({ onSearch, onShowAdmin, onShowTV, onShowMovies, onShowSeries, onShowChat, currentView }: NetflixHeaderProps) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Navegación con teclado para Android TV
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showSearch) {
        handleSearch(e as any);
      } else {
        setShowSearch(true);
      }
    } else if (e.key === 'Escape') {
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-red-600 tracking-tight">
              365GUTY
            </h1>
            
            {/* Navegación principal */}
            <nav className="hidden md:flex space-x-6">
              <Button
                variant="ghost"
                className={`text-white hover:text-gray-300 focus:text-white focus:bg-white/10 ${
                  currentView === 'home' ? 'text-red-500' : ''
                }`}
                onClick={onShowMovies}
                onKeyDown={handleKeyDown}
              >
                <Film className="w-4 h-4 mr-2" />
                Películas
              </Button>
              <Button
                variant="ghost"
                className={`text-white hover:text-gray-300 focus:text-white focus:bg-white/10 ${
                  currentView === 'series' ? 'text-red-500' : ''
                }`}
                onClick={onShowSeries}
                onKeyDown={handleKeyDown}
              >
                <Monitor className="w-4 h-4 mr-2" />
                Series
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:text-gray-300 focus:text-white focus:bg-white/10"
                onClick={onShowChat}
                onKeyDown={handleKeyDown}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
              </Button>
              <Button
                variant="ghost"
                className={`text-white hover:text-gray-300 focus:text-white focus:bg-white/10 ${
                  currentView === 'tv' ? 'text-red-500' : ''
                }`}
                onClick={onShowTV}
                onKeyDown={handleKeyDown}
              >
                <Tv className="w-4 h-4 mr-2" />
                TV
              </Button>
            </nav>
          </div>

          {/* Barra de búsqueda y menú usuario */}
          <div className="flex items-center space-x-4">
            {/* Búsqueda */}
            <div className="relative">
              {showSearch ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <Input
                    type="text"
                    placeholder="Buscar películas, series, géneros..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 bg-black border-white/20 text-white placeholder:text-gray-400 focus:border-red-500"
                    autoFocus
                    onBlur={() => {
                      if (!searchQuery) {
                        setShowSearch(false);
                      }
                    }}
                    onKeyDown={handleKeyDown}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="ghost"
                    className="ml-2 text-white hover:text-red-500"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </form>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-red-500 focus:text-red-500 focus:bg-white/10"
                  onClick={() => setShowSearch(true)}
                  onKeyDown={handleKeyDown}
                >
                  <Search className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Menú de usuario */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-gray-300 focus:text-white focus:bg-white/10"
                  onKeyDown={handleKeyDown}
                >
                  <User className="w-5 h-5 mr-2" />
                  {user?.name || 'Usuario'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-black/90 border-white/20 text-white"
              >
                <DropdownMenuItem className="focus:bg-white/10">
                  <User className="w-4 h-4 mr-2" />
                  {user?.name || 'Usuario'}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/20" />
                {user?.isAdmin && (
                  <DropdownMenuItem 
                    className="focus:bg-white/10 cursor-pointer"
                    onClick={onShowAdmin}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Panel Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  className="focus:bg-white/10 cursor-pointer text-red-400"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
