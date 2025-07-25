
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Obtener episodio específico
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const episode = await prisma.episode.findUnique({
      where: { id: params.id },
      include: {
        season: {
          include: {
            series: true
          }
        }
      }
    });

    if (!episode) {
      return NextResponse.json(
        { success: false, error: 'Episodio no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      episode,
    });
  } catch (error) {
    console.error('Error obteniendo episodio:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar episodio (solo admin)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      number,
      title,
      synopsis,
      duration,
      videoUrl,
      thumbnailUrl,
      airDate,
    } = data;

    // Validación
    if (!number || !title || !duration || !videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos (number, title, duration, videoUrl)' },
        { status: 400 }
      );
    }

    // Verificar que el episodio existe
    const existingEpisode = await prisma.episode.findUnique({
      where: { id: params.id }
    });

    if (!existingEpisode) {
      return NextResponse.json(
        { success: false, error: 'Episodio no encontrado' },
        { status: 404 }
      );
    }

    // Si se cambió el número, verificar que no haya conflicto
    if (parseInt(number) !== existingEpisode.number) {
      const conflictingEpisode = await prisma.episode.findUnique({
        where: {
          seasonId_number: {
            seasonId: existingEpisode.seasonId,
            number: parseInt(number)
          }
        }
      });

      if (conflictingEpisode) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un episodio con ese número en esta temporada' },
          { status: 400 }
        );
      }
    }

    const episode = await prisma.episode.update({
      where: { id: params.id },
      data: {
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

    return NextResponse.json({
      success: true,
      episode,
    });
  } catch (error) {
    console.error('Error actualizando episodio:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar episodio (solo admin)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Verificar que el episodio existe y obtener seasonId
    const episode = await prisma.episode.findUnique({
      where: { id: params.id }
    });

    if (!episode) {
      return NextResponse.json(
        { success: false, error: 'Episodio no encontrado' },
        { status: 404 }
      );
    }

    const seasonId = episode.seasonId;

    // Eliminar episodio
    await prisma.episode.delete({
      where: { id: params.id }
    });

    // Actualizar contadores
    await updateCounters(seasonId);

    return NextResponse.json({
      success: true,
      message: 'Episodio eliminado correctamente'
    });
  } catch (error) {
    console.error('Error eliminando episodio:', error);
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
