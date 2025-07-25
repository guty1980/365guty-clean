
import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { password, deviceId } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'La contraseña es requerida' },
        { status: 400 }
      );
    }

    const result = await authenticateUser(password, deviceId);

    if (!result.success) {
      return NextResponse.json(result, { status: 401 });
    }

    // Establecer cookie de autenticación
    const cookieStore = cookies();
    cookieStore.set('auth-token', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: result.user,
    });
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
