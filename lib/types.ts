// Tipos para Movies
export interface Movie {
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
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para Series (expandido con relaciones)
export interface Series {
  id: string;
  title: string;
  synopsis: string;
  genre: string;
  year: number;
  seasons: number;
  episodes: number;
  ranking: number;
  coverUrl: string;
  videoUrl: string;
  isRecommended: boolean;
  createdAt: Date;
  updatedAt: Date;
  seasonsList?: Season[]; // Relación opcional con temporadas
}

// Tipos para Temporadas
export interface Season {
  id: string;
  seriesId: string;
  number: number;
  title: string;
  year: number;
  description?: string;
  coverUrl?: string;
  totalEpisodes: number;
  createdAt: Date;
  updatedAt: Date;
  series?: Series; // Relación opcional con serie
  episodes?: Episode[]; // Relación opcional con episodios
}

// Tipos para Episodios
export interface Episode {
  id: string;
  seasonId: string;
  number: number;
  title: string;
  synopsis?: string;
  duration: number;
  videoUrl: string;
  thumbnailUrl?: string;
  airDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  season?: Season; // Relación opcional con temporada
}

// Tipos para Channels
export interface Channel {
  id: string;
  name: string;
  coverUrl: string;
  m3u8Url: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para Users
export interface User {
  id: string;
  name: string;
  password: string;
  allowedDevices: number;
  isSuspended: boolean;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para Messages
export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  createdAt: Date;
  sender: User;
  receiver: User;
}

export type DateRange = {
  from: Date | undefined
  to: Date | undefined
}