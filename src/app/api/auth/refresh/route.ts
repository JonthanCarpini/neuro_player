import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  signUserToken,
  signAdminToken,
  signProviderToken,
  generateRefreshToken,
} from '@/lib/auth';

const REFRESH_EXPIRES_DAYS = Number(process.env.JWT_REFRESH_EXPIRES_DAYS) || 30;

// POST /api/auth/refresh
// Body: { refreshToken: string }
export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();
    if (!refreshToken) {
      return NextResponse.json({ error: 'refreshToken obrigatório' }, { status: 400 });
    }

    // 1. Buscar refresh token válido
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!stored || stored.revoked || new Date() > stored.expiresAt) {
      return NextResponse.json({ error: 'Refresh token inválido ou expirado' }, { status: 401 });
    }

    // 2. Revogar o token antigo
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    // 3. Gerar novo access token baseado no tipo
    let token: string;

    switch (stored.userType) {
      case 'admin': {
        const admin = await prisma.admin.findUnique({ where: { id: stored.userId } });
        if (!admin || !admin.active) {
          return NextResponse.json({ error: 'Usuário inativo' }, { status: 401 });
        }
        token = signAdminToken({ adminId: admin.id });
        break;
      }
      case 'provedor': {
        const provider = await prisma.provider.findUnique({ where: { id: stored.userId } });
        if (!provider || !provider.active) {
          return NextResponse.json({ error: 'Provedor inativo' }, { status: 401 });
        }
        token = signProviderToken({ providerId: provider.id });
        break;
      }
      case 'usuario': {
        const user = await prisma.user.findUnique({ where: { id: BigInt(stored.userId) } });
        if (!user || !user.active) {
          return NextResponse.json({ error: 'Usuário inativo' }, { status: 401 });
        }
        token = signUserToken({
          userId: Number(user.id),
          providerId: user.providerId,
          providerLogin: user.providerLogin,
        });
        break;
      }
      default:
        return NextResponse.json({ error: 'Tipo de usuário inválido' }, { status: 400 });
    }

    // 4. Gerar novo refresh token
    const newRefreshToken = generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRES_DAYS);

    await prisma.refreshToken.create({
      data: {
        userType: stored.userType,
        userId: stored.userId,
        token: newRefreshToken,
        expiresAt,
      },
    });

    return NextResponse.json({ token, refreshToken: newRefreshToken });
  } catch (err) {
    console.error('[auth/refresh]', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
