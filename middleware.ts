
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/login', '/api/auth/login', '/api/auth/me', '/api/debug/token', '/api/debug/current-user', '/api/debug/middleware'];
  
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // VERIFICACIÓN SÚPER BÁSICA - solo comprobar que existe token
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si hay token, permitir acceso (sin verificar JWT por ahora)
  if (token && token.length > 50) {
    return NextResponse.next();
  }

  // Token demasiado corto, probablemente inválido
  const response = NextResponse.redirect(new URL('/login', request.url));
  response.cookies.delete('auth-token');
  return response;
}

export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas de solicitud excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (favicon)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
