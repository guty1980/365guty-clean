
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Obtener todos los episodios o por temporada
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const seasonId = searchParams.get('seasonId');
    const seriesId = searchParams.get('seriesId');

    let episodes;
    
    if (seasonId) {
      // Obtener episodios de una temporada específica
      episodes = await prisma.episode.findMany({
        where: { seasonId },
        include: {
          season: {
            include: {
              series: true
            }
          }
        },
        orderBy: { number: 'asc' }
      });
    } else if (seriesId) {
      // Obtener todos los episodios de una serie
      episodes = await prisma.episode.findMany({
        where: {
          season: {
            seriesId
          }
        },
        include: {
          season: {
            include: {
              series: true
            }
          }
        },
        orderBy: [
          { season: { number: 'asc' } },
          { number: 'asc' }
        ]
      });
    } else {
      // Obtener todos los episodios
      episodes = await prisma.episode.findMany({
        include: {
          season: {
            include: {
              series: true
            }
          }
        },
        orderBy: [
          { season: { series: { title: 'asc' } } },
          { season: { number: 'asc' } },
          { number: 'asc' }
        ]
      });
    }

    return NextResponse.json({
      success: true,
      episodes,
    });
  } catch (error) {
    console.error('Error obteniendo episodios:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo episodio (solo admin)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const {
      seasonId,
      number,
      title,
      synopsis,
      duration,
      videoUrl,
      thumbnailUrl,
      airDate,
    } = data;

    // Validación
    if (!seasonId || !number || !title || !duration || !videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos (seasonId, number, title, duration, videoUrl)' },
        { status: 400 }
      );
    }

    // Verificar que la temporada existe
    const season = await prisma.season.findUnique({
      where: { id: seasonId }
    });

    if (!season) {
      return NextResponse.json(
        { success: false, error: 'Temporada no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que no existe ya un episodio con ese número en la temporada
    const existingEpisode = await prisma.episode.findUnique({
      where: {
        seasonId_number: {
          seasonId,
          number: parseInt(number)
        }
      }
    });

    if (existingEpisode) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un episodio con ese número en esta temporada' },
        { status: 400 }
      );
    }

    const episode = await prisma.episode.create({
      data: {
        seasonId,
        number: parseInt(number),
        title,
        synopsis: synopsis || null,
        duration: parseInt(duration),
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        airDate: airDate ? new Date(airDate) : null,
      },
      include: {
        season: {
          include: {
            series: true
          }
        }
      }
    });

    // Actualizar contadores
    await updateCounters(seasonId);

    return NextResponse.json({
      success: true,
      episode,
    });
  } catch (error) {
    console.error('Error creando episodio:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función auxiliar para actualizar contadores
async function updateCounters(seasonId: string) {
  const season = await prisma.season.findUnique({
    where: { id: seasonId },
    include: { 
      episodes: true,
      series: {
        include: {
          seasonsList: {
            include: { episodes: true }
          }
        }
      }
    }
  });

  if (!season) return;

  // Actualizar totalEpisodes en la temporada
  await prisma.season.update({
    where: { id: seasonId },
    data: { totalEpisodes: season.episodes.length }
  });

  // Actualizar contadores en la serie
  const totalSeasons = season.series.seasonsList.length;
  const totalEpisodes = season.series.seasonsList.reduce(
    (sum, s) => sum + s.episodes.length, 0
  );

  await prisma.series.update({
    where: { id: season.seriesId },
    data: {
      seasons: totalSeasons,
      episodes: totalEpisodes
    }
  });
}
