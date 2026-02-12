import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signAdminToken, comparePassword, generateRefreshToken } from '@/lib/auth';

const REFRESH_EXPIRES_DAYS = Number(process.env.JWT_REFRESH_EXPIRES_DAYS) || 30;

// POST /api/admin/login
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha obrigatórios' }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin || !admin.active) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    const valid = await comparePassword(password, admin.password);
    if (!valid) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastAccess: new Date() },
    });

    const token = signAdminToken({ adminId: admin.id });

    // Refresh token
    const refreshTokenStr = generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRES_DAYS);
    await prisma.refreshToken.create({
      data: { userType: 'admin', userId: admin.id, token: refreshTokenStr, expiresAt },
    });

    return NextResponse.json({
      token,
      refreshToken: refreshTokenStr,
      user: { id: admin.id, name: admin.name, email: admin.email, role: 'admin' },
    });
  } catch (err) {
    console.error('[admin/login]', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
