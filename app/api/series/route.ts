

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Obtener todas las series
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
    const includeSeasons = searchParams.get('includeSeasons') === 'true';

    const series = await prisma.series.findMany({
      include: includeSeasons ? {
        seasonsList: {
          include: {
            episodes: {
              orderBy: { number: 'asc' }
            }
          },
          orderBy: { number: 'asc' }
        }
      } : undefined,
      orderBy: [
        { isRecommended: 'desc' },
        { ranking: 'desc' },
        { createdAt: 'desc' }
      ],
    });

    return NextResponse.json({
      success: true,
      series,
    });
  } catch (error) {
    console.error('Error obteniendo series:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva serie (solo admin)
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
      seasons,
      episodes,
      ranking,
      coverUrl,
      videoUrl,
      isRecommended = false,
    } = data;

    // Validación
    if (!title || !synopsis || !genre || !year || !seasons || !episodes || !coverUrl || !videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const series = await prisma.series.create({
      data: {
        title,
        synopsis,
        genre,
        year: parseInt(year),
        seasons: parseInt(seasons),
        episodes: parseInt(episodes),
        ranking: parseFloat(ranking) || 0,
        coverUrl,
        videoUrl,
        isRecommended: Boolean(isRecommended),
      },
    });

    return NextResponse.json({
      success: true,
      series,
    });
  } catch (error) {
    console.error('Error creando serie:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
