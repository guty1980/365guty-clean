
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();
  let lastMessageId = 0;

  const stream = new ReadableStream({
    async start(controller) {
      // Función para enviar mensajes
      const sendMessage = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Obtener últimos mensajes
      const getLatestMessages = async () => {
        try {
          const messages = await prisma.message.findMany({
            where: {
              OR: [
                { senderId: user.id },
                { receiverId: user.id },
                user.isAdmin ? {} : { senderId: user.id }
              ],
              id: {
                gt: lastMessageId.toString()
              }
            },
            include: {
              sender: {
                select: { id: true, name: true, isAdmin: true }
              },
              receiver: {
                select: { id: true, name: true, isAdmin: true }
              }
            },
            orderBy: { createdAt: 'asc' },
            take: 50
          });

          if (messages.length > 0) {
            lastMessageId = parseInt(messages[messages.length - 1].id);
            sendMessage({ type: 'messages', data: messages });
          }
        } catch (error) {
          console.error('Error obteniendo mensajes:', error);
        }
      };

      // Enviar mensajes iniciales
      await getLatestMessages();

      // Polling cada 2 segundos para nuevos mensajes
      const interval = setInterval(getLatestMessages, 2000);

      // Limpiar cuando se cierre la conexión
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
