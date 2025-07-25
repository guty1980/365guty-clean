
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Obtener película por ID
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

    const movie = await prisma.movie.findUnique({
      where: { id: params.id },
    });

    if (!movie) {
      return NextResponse.json(
        { success: false, error: 'Película no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      movie,
    });
  } catch (error) {
    console.error('Error obteniendo película:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar película (solo admin)
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
      duration,
      ranking,
      coverUrl,
      videoUrl,
      isRecommended,
    } = data;

    const movie = await prisma.movie.update({
      where: { id: params.id },
      data: {
        title,
        synopsis,
        genre,
        year: parseInt(year),
        duration: parseInt(duration),
        ranking: parseFloat(ranking),
        coverUrl,
        videoUrl,
        isRecommended: Boolean(isRecommended),
      },
    });

    return NextResponse.json({
      success: true,
      movie,
    });
  } catch (error) {
    console.error('Error actualizando película:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar película (solo admin)
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

    await prisma.movie.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Película eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error eliminando película:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
