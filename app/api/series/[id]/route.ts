
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Obtener serie específica
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

    const { searchParams } = new URL(request.url);
    const includeSeasons = searchParams.get('includeSeasons') === 'true';

    const series = await prisma.series.findUnique({
      where: { id: params.id },
      include: includeSeasons ? {
        seasonsList: {
          include: {
            episodes: {
              orderBy: { number: 'asc' }
            }
          },
          orderBy: { number: 'asc' }
        }
      } : undefined
    });

    if (!series) {
      return NextResponse.json(
        { success: false, error: 'Serie no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      series,
    });
  } catch (error) {
    console.error('Error obteniendo serie:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar serie (solo admin)
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
      title,
      synopsis,
      genre,
      year,
      ranking,
      coverUrl,
      videoUrl,
      isRecommended = false,
    } = data;

    // Validación
    if (!title || !synopsis || !genre || !year || !coverUrl || !videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que la serie existe
    const existingSeries = await prisma.series.findUnique({
      where: { id: params.id }
    });

    if (!existingSeries) {
      return NextResponse.json(
        { success: false, error: 'Serie no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar serie (los contadores se mantienen automáticamente)
    const series = await prisma.series.update({
      where: { id: params.id },
      data: {
        title,
        synopsis,
        genre,
        year: parseInt(year),
        ranking: parseFloat(ranking) || 0,
        coverUrl,
        videoUrl,
        isRecommended: Boolean(isRecommended),
      },
      include: {
        seasonsList: {
          include: {
            episodes: {
              orderBy: { number: 'asc' }
            }
          },
          orderBy: { number: 'asc' }
        }
      }
    });

    return NextResponse.json({
      success: true,
      series,
    });
  } catch (error) {
    console.error('Error actualizando serie:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar serie (solo admin)
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

    // Verificar que la serie existe
    const series = await prisma.series.findUnique({
      where: { id: params.id }
    });

    if (!series) {
      return NextResponse.json(
        { success: false, error: 'Serie no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar serie (temporadas y episodios se eliminan automáticamente por cascade)
    await prisma.series.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Serie eliminada correctamente'
    });
  } catch (error) {
    console.error('Error eliminando serie:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
