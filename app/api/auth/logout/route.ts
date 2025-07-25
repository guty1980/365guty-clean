
import { NextRequest, NextResponse } from 'next/server';
import { logout } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (token) {
      await logout(token);
    }

    // Eliminar cookie
    cookieStore.delete('auth-token');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en logout:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}
