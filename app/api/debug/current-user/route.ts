
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔍 Debug getCurrentUser - Iniciando...');
    const user = await getCurrentUser();
    console.log('👤 Debug getCurrentUser - Resultado:', user);

    return NextResponse.json({
      success: !!user,
      user: user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('💥 Debug getCurrentUser - Error:', errorMessage);
    return NextResponse.json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
}
