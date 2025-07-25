
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './db';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'guty-secret-2024';

// Verificar contraseña y crear sesión
export async function authenticateUser(password: string, deviceId?: string) {
  try {
    // Buscar todos los usuarios activos para verificar contraseñas
    const users = await prisma.user.findMany({
      where: {
        isSuspended: false,
      },
    });

    let user = null;
    
    // Verificar contraseña con bcrypt para cada usuario
    for (const u of users) {
      const isValid = await bcrypt.compare(password, u.password);
      if (isValid) {
        user = u;
        break;
      }
    }

    if (!user) {
      return { success: false, error: 'Contraseña incorrecta' };
    }

    // Verificar límite de dispositivos
    if (deviceId) {
      const activeSessions = await prisma.session.count({
        where: {
          userId: user.id,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (activeSessions >= user.allowedDevices) {
        return { success: false, error: 'Límite de dispositivos alcanzado' };
      }
    }

    // Crear token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        isAdmin: user.isAdmin,
        name: user.name 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Crear sesión en la base de datos
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token,
        deviceId: deviceId || null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      },
    });

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        isAdmin: user.isAdmin,
        allowedDevices: user.allowedDevices,
      },
      token,
      session: session.id,
    };
  } catch (error) {
    console.error('Error en autenticación:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

// Verificar token y obtener usuario
export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Verificar si la sesión existe y no ha expirado
    const session = await prisma.session.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!session || session.user.isSuspended) {
      return null;
    }

    return {
      id: session.user.id,
      name: session.user.name,
      isAdmin: session.user.isAdmin,
      allowedDevices: session.user.allowedDevices,
    };
  } catch (error) {
    return null;
  }
}

// Obtener usuario actual del servidor
export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    return await verifyToken(token);
  } catch (error) {
    return null;
  }
}

// Cerrar sesión
export async function logout(token: string) {
  try {
    await prisma.session.deleteMany({
      where: {
        token,
      },
    });
    return { success: true };
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return { success: false, error: 'Error al cerrar sesión' };
  }
}

// Limpiar sesiones expiradas
export async function cleanExpiredSessions() {
  try {
    await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  } catch (error) {
    console.error('Error limpiando sesiones:', error);
  }
}
