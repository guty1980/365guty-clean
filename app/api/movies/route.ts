
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Obtener todas las películas
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const movies = await prisma.movie.findMany({
      orderBy: [
        { isRecommended: 'desc' },
        { ranking: 'desc' },
        { createdAt: 'desc' }
      ],
    });

    return NextResponse.json({
      success: true,
      movies,
    });
  } catch (error) {
    console.error('Error obteniendo películas:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva película (solo admin)
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
      title,
      synopsis,
      genre,
      year,
      duration,
      ranking,
      coverUrl,
      videoUrl,
      isRecommended = false,
    } = data;

    // Validación
    if (!title || !synopsis || !genre || !year || !duration || !coverUrl || !videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const movie = await prisma.movie.create({
      data: {
        title,
        synopsis,
        genre,
        year: parseInt(year),
        duration: parseInt(duration),
        ranking: parseFloat(ranking) || 0,
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
    console.error('Error creando película:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
