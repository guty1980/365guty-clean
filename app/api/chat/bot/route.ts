
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { message } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ success: false, error: 'Mensaje requerido' }, { status: 400 });
    }

    // Obtener contexto de películas y canales para el bot
    const [movies, channels] = await Promise.all([
      prisma.movie.findMany({
        select: { title: true, genre: true, year: true, synopsis: true, ranking: true }
      }),
      prisma.channel.findMany({
        select: { name: true }
      })
    ]);

    const contextPrompt = `Eres un asistente virtual inteligente de 365GUTY, una plataforma de streaming como Netflix. Tu objetivo es ayudar a los usuarios con información sobre películas, canales y el uso de la plataforma.

CONTEXTO DE LA PLATAFORMA:
- Películas disponibles: ${movies.map(m => `"${m.title}" (${m.year}) - ${m.genre} - Puntuación: ${m.ranking}/10`).join(', ')}
- Canales disponibles: ${channels.map(c => c.name).join(', ')}

INSTRUCCIONES:
- Responde de manera amigable y útil
- Si preguntan sobre películas específicas, usa la información proporcionada
- Si preguntan sobre géneros, recomienda películas de nuestro catálogo
- Para problemas técnicos, da soluciones básicas
- Si no sabes algo específico, admítelo pero ofrece ayuda alternativa
- Mantén respuestas concisas pero informativas
- Usa un tono casual pero profesional

Pregunta del usuario: ${message}`;

    // Llamar a la API de LLM
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'user', content: contextPrompt }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Error en la API de LLM');
    }

    const data = await response.json();
    const botResponse = data.choices[0]?.message?.content || 'Lo siento, no pude procesar tu consulta en este momento.';

    // Guardar mensaje del usuario
    await prisma.message.create({
      data: {
        content: message,
        senderId: user.id,
        receiverId: user.isAdmin ? user.id : (await prisma.user.findFirst({ where: { isAdmin: true } }))?.id || user.id,
        isRead: false,
      },
    });

    // Guardar respuesta del bot
    const botUser = await prisma.user.findFirst({ where: { isAdmin: true } });
    if (botUser) {
      await prisma.message.create({
        data: {
          content: `🤖 ${botResponse}`,
          senderId: botUser.id,
          receiverId: user.id,
          isRead: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      response: botResponse
    });

  } catch (error) {
    console.error('Error en bot:', error);
    return NextResponse.json(
      { success: false, error: 'Error del bot inteligente' },
      { status: 500 }
    );
  }
}
