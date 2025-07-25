
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Obtener todas las temporadas o por serie
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
    const seriesId = searchParams.get('seriesId');

    let seasons;
    
    if (seriesId) {
      // Obtener temporadas de una serie específica
      seasons = await prisma.season.findMany({
        where: { seriesId },
        include: {
          episodes: {
            orderBy: { number: 'asc' }
          },
          series: true
        },
        orderBy: { number: 'asc' }
      });
    } else {
      // Obtener todas las temporadas
      seasons = await prisma.season.findMany({
        include: {
          episodes: {
            orderBy: { number: 'asc' }
          },
          series: true
        },
        orderBy: [
          { series: { title: 'asc' } },
          { number: 'asc' }
        ]
      });
    }

    return NextResponse.json({
      success: true,
      seasons,
    });
  } catch (error) {
    console.error('Error obteniendo temporadas:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva temporada (solo admin)
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
      seriesId,
      number,
      title,
      year,
      description,
      coverUrl,
    } = data;

    // Validación
    if (!seriesId || !number || !title || !year) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos (seriesId, number, title, year)' },
        { status: 400 }
      );
    }

    // Verificar que la serie existe
    const series = await prisma.series.findUnique({
      where: { id: seriesId }
    });

    if (!series) {
      return NextResponse.json(
        { success: false, error: 'Serie no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que no existe ya una temporada con ese número
    const existingSeason = await prisma.season.findUnique({
      where: {
        seriesId_number: {
          seriesId,
          number: parseInt(number)
        }
      }
    });

    if (existingSeason) {
      return NextResponse.json(
        { success: false, error: 'Ya existe una temporada con ese número' },
        { status: 400 }
      );
    }

    const season = await prisma.season.create({
      data: {
        seriesId,
        number: parseInt(number),
        title,
        year: parseInt(year),
        description: description || null,
        coverUrl: coverUrl || null,
      },
      include: {
        episodes: true,
        series: true
      }
    });

    // Actualizar contador de temporadas en la serie
    await updateSeriesCounters(seriesId);

    return NextResponse.json({
      success: true,
      season,
    });
  } catch (error) {
    console.error('Error creando temporada:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función auxiliar para actualizar contadores de serie
async function updateSeriesCounters(seriesId: string) {
  const seasons = await prisma.season.findMany({
    where: { seriesId },
    include: { episodes: true }
  });

  const totalSeasons = seasons.length;
  const totalEpisodes = seasons.reduce((sum, season) => sum + season.episodes.length, 0);

  await prisma.series.update({
    where: { id: seriesId },
    data: {
      seasons: totalSeasons,
      episodes: totalEpisodes
    }
  });

  // Actualizar totalEpisodes en cada temporada
  for (const season of seasons) {
    await prisma.season.update({
      where: { id: season.id },
      data: { totalEpisodes: season.episodes.length }
    });
  }
}
