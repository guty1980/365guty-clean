
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No token found' });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'guty-secret-2024';
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      return NextResponse.json({
        success: true,
        tokenPresent: true,
        tokenLength: token.length,
        decoded: {
          userId: decoded.userId,
          name: decoded.name,
          isAdmin: decoded.isAdmin,
          exp: decoded.exp,
          iat: decoded.iat
        },
        isValid: !!(decoded.userId && decoded.name)
      });
    } catch (jwtError) {
      const errorMessage = jwtError instanceof Error ? jwtError.message : 'JWT verification failed';
      return NextResponse.json({
        success: false,
        tokenPresent: true,
        tokenLength: token.length,
        error: errorMessage
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    });
  }
}
