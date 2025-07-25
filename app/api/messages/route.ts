
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Obtener mensajes del usuario
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    let messages;

    if (user.isAdmin) {
      // Admin ve todos los mensajes
      messages = await prisma.message.findMany({
        include: {
          sender: {
            select: {
              name: true,
              isAdmin: true,
            },
          },
          receiver: {
            select: {
              name: true,
              isAdmin: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
    } else {
      // Usuario normal solo ve sus mensajes con el admin
      const adminUser = await prisma.user.findFirst({
        where: { isAdmin: true },
      });

      if (!adminUser) {
        return NextResponse.json({
          success: true,
          messages: [],
        });
      }

      messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: user.id, receiverId: adminUser.id },
            { senderId: adminUser.id, receiverId: user.id },
          ],
        },
        include: {
          sender: {
            select: {
              name: true,
              isAdmin: true,
            },
          },
          receiver: {
            select: {
              name: true,
              isAdmin: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
    }

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('Error obteniendo mensajes:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Enviar mensaje
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { content, receiverId } = data;

    if (!content?.trim()) {
      return NextResponse.json(
        { success: false, error: 'El mensaje no puede estar vacío' },
        { status: 400 }
      );
    }

    let targetReceiverId = receiverId;

    // Si no se especifica receptor, buscar al admin (para usuarios normales)
    if (!targetReceiverId && !user.isAdmin) {
      const adminUser = await prisma.user.findFirst({
        where: { isAdmin: true },
      });

      if (!adminUser) {
        return NextResponse.json(
          { success: false, error: 'No se encontró administrador' },
          { status: 400 }
        );
      }

      targetReceiverId = adminUser.id;
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: user.id,
        receiverId: targetReceiverId,
        isRead: false,
      },
      include: {
        sender: {
          select: {
            name: true,
            isAdmin: true,
          },
        },
        receiver: {
          select: {
            name: true,
            isAdmin: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error enviando mensaje:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
