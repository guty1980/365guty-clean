
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Obtener todos los canales
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const channels = await prisma.channel.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      channels,
    });
  } catch (error) {
    console.error('Error obteniendo canales:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo canal (solo admin)
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
    const { name, coverUrl, m3u8Url } = data;

    // Validación
    if (!name || !coverUrl || !m3u8Url) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const channel = await prisma.channel.create({
      data: {
        name,
        coverUrl,
        m3u8Url,
      },
    });

    return NextResponse.json({
      success: true,
      channel,
    });
  } catch (error) {
    console.error('Error creando canal:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
