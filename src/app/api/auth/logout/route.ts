import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/auth/logout
// Body: { refreshToken: string }
export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();
    if (!refreshToken) {
      return NextResponse.json({ error: 'refreshToken obrigatório' }, { status: 400 });
    }

    // Revogar o refresh token
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken, revoked: false },
      data: { revoked: true },
    });

    return NextResponse.json({ success: true, message: 'Logout realizado' });
  } catch (err) {
    console.error('[auth/logout]', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
