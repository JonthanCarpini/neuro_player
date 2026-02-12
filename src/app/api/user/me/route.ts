import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/user/me — dados completos do usuário autenticado
export async function GET(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: BigInt(auth.userId) },
    include: {
      provider: {
        select: {
          id: true,
          code: true,
          name: true,
          logo: true,
          banner: true,
          urlPrimary: true,
          urlBackup1: true,
          urlBackup2: true,
        },
      },
      profiles: {
        where: { active: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }

  const providerData = user.providerData as Record<string, unknown> | null;

  return NextResponse.json({
    id: Number(user.id),
    username: user.providerLogin,
    language: user.language,
    parentalActive: user.parentalActive,
    parentalPin: user.parentalPin,
    provedor: {
      id: user.provider.id,
      code: user.provider.code,
      name: user.provider.name,
      logo: user.provider.logo,
      banner: user.provider.banner,
    },
    xui: providerData ? {
      baseUrl: providerData.base_url,
      username: user.providerLogin,
      password: providerData.password,
    } : null,
    perfis: user.profiles.map((p: { id: bigint; name: string; avatar: string; type: string; isKid: boolean; pinProtected: boolean }) => ({
      id: Number(p.id),
      name: p.name,
      avatar: p.avatar,
      type: p.type,
      isKid: p.isKid,
      pinProtected: p.pinProtected,
    })),
  });
}
