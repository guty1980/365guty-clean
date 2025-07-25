
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Obtener temporada específica
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

    const season = await prisma.season.findUnique({
      where: { id: params.id },
      include: {
        episodes: {
          orderBy: { number: 'asc' }
        },
        series: true
      }
    });

    if (!season) {
      return NextResponse.json(
        { success: false, error: 'Temporada no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      season,
    });
  } catch (error) {
    console.error('Error obteniendo temporada:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar temporada (solo admin)
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
      year,
      description,
      coverUrl,
    } = data;

    // Validación
    if (!number || !title || !year) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos (number, title, year)' },
        { status: 400 }
      );
    }

    // Verificar que la temporada existe
    const existingSeason = await prisma.season.findUnique({
      where: { id: params.id }
    });

    if (!existingSeason) {
      return NextResponse.json(
        { success: false, error: 'Temporada no encontrada' },
        { status: 404 }
      );
    }

    // Si se cambió el número, verificar que no haya conflicto
    if (parseInt(number) !== existingSeason.number) {
      const conflictingSeason = await prisma.season.findUnique({
        where: {
          seriesId_number: {
            seriesId: existingSeason.seriesId,
            number: parseInt(number)
          }
        }
      });

      if (conflictingSeason) {
        return NextResponse.json(
          { success: false, error: 'Ya existe una temporada con ese número' },
          { status: 400 }
        );
      }
    }

    const season = await prisma.season.update({
      where: { id: params.id },
      data: {
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

    return NextResponse.json({
      success: true,
      season,
    });
  } catch (error) {
    console.error('Error actualizando temporada:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar temporada (solo admin)
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

    // Verificar que la temporada existe y obtener seriesId
    const season = await prisma.season.findUnique({
      where: { id: params.id }
    });

    if (!season) {
      return NextResponse.json(
        { success: false, error: 'Temporada no encontrada' },
        { status: 404 }
      );
    }

    const seriesId = season.seriesId;

    // Eliminar temporada (episodios se eliminan automáticamente por cascade)
    await prisma.season.delete({
      where: { id: params.id }
    });

    // Actualizar contadores de la serie
    await updateSeriesCounters(seriesId);

    return NextResponse.json({
      success: true,
      message: 'Temporada eliminada correctamente'
    });
  } catch (error) {
    console.error('Error eliminando temporada:', error);
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
