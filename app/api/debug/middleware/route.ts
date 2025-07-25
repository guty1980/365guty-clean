
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Simular exactamente lo que hace el middleware
    const pathname = '/'; // Simular acceso a la página principal
    
    // Rutas públicas que no requieren autenticación
    const publicPaths = ['/login', '/api/auth/login', '/api/auth/me', '/api/debug/token', '/api/debug/current-user'];
    
    const isPublicPath = publicPaths.includes(pathname);
    
    // Verificar token de autenticación
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({
        step: 'NO_TOKEN',
        error: 'No token found',
        isPublicPath,
        pathname
      });
    }

    // Verificar JWT (sin base de datos para evitar problemas de contexto)
    let decoded: any;
    let jwtError: string | null = null;
    
    try {
      const JWT_SECRET = process.env.JWT_SECRET || 'guty-secret-2024';
      console.log('🔑 JWT_SECRET being used:', JWT_SECRET);
      console.log('🔑 Token length:', token.length);
      console.log('🔑 Token start:', token.substring(0, 50));
      
      decoded = jwt.verify(token, JWT_SECRET) as any;
      console.log('✅ JWT decoded successfully:', decoded);
      
      // Verificar que el token no haya expirado (JWT ya maneja esto)
      if (!decoded.userId || !decoded.name) {
        jwtError = 'Token incompleto - missing userId or name';
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown JWT error';
      jwtError = `JWT verification failed: ${errorMessage}`;
      console.log('❌ JWT error:', errorMessage);
    }
    
    return NextResponse.json({
      step: jwtError ? 'JWT_ERROR' : 'SUCCESS',
      isPublicPath,
      pathname,
      tokenPresent: !!token,
      tokenLength: token?.length,
      jwtError,
      decoded: jwtError ? null : {
        userId: decoded?.userId,
        name: decoded?.name,
        isAdmin: decoded?.isAdmin,
        exp: decoded?.exp,
        iat: decoded?.iat
      },
      jwtSecret: process.env.JWT_SECRET ? 'SET' : 'NOT_SET',
      currentTime: Math.floor(Date.now() / 1000)
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown general error';
    return NextResponse.json({
      step: 'GENERAL_ERROR',
      error: errorMessage
    });
  }
}
