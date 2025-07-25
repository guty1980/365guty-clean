
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Obtener canal por ID
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

    const channel = await prisma.channel.findUnique({
      where: { id: params.id },
    });

    if (!channel) {
      return NextResponse.json(
        { success: false, error: 'Canal no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      channel,
    });
  } catch (error) {
    console.error('Error obteniendo canal:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar canal (solo admin)
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
    const { name, coverUrl, m3u8Url } = data;

    const channel = await prisma.channel.update({
      where: { id: params.id },
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
    console.error('Error actualizando canal:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar canal (solo admin)
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

    await prisma.channel.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Canal eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error eliminando canal:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
