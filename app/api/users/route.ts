
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// GET - Obtener todos los usuarios (solo admin)
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        allowedDevices: true,
        isSuspended: true,
        isAdmin: true,
        createdAt: true,
        // No incluir contraseña
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo usuario (solo admin)
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
    const { name, password, allowedDevices = 1, isAdmin = false } = data;

    // Validación
    if (!name || !password) {
      return NextResponse.json(
        { success: false, error: 'Nombre y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        name,
        password: hashedPassword,
        allowedDevices: parseInt(allowedDevices),
        isAdmin: Boolean(isAdmin),
        isSuspended: false,
      },
      select: {
        id: true,
        name: true,
        allowedDevices: true,
        isSuspended: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: newUser,
    });
  } catch (error) {
    console.error('Error creando usuario:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
