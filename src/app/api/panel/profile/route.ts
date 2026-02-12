import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getProviderFromRequest, hashPassword, comparePassword } from '@/lib/auth';

// GET /api/panel/profile — dados do provedor autenticado
export async function GET(req: NextRequest) {
  const auth = getProviderFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const provider = await prisma.provider.findUnique({
    where: { id: auth.providerId },
    select: {
      id: true, code: true, name: true, email: true,
      logo: true, banner: true, urlPrimary: true,
      urlBackup1: true, urlBackup2: true, active: true,
      dueDate: true, createdAt: true,
      _count: { select: { users: true } },
    },
  });

  if (!provider) return NextResponse.json({ error: 'Provedor não encontrado' }, { status: 404 });

  return NextResponse.json({
    ...provider,
    usersCount: provider._count.users,
    _count: undefined,
  });
}

// PUT /api/panel/profile — atualizar perfil do provedor
export async function PUT(req: NextRequest) {
  const auth = getProviderFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const body = await req.json();
  const { name, logo, banner, currentPassword, newPassword } = body;

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (logo !== undefined) updateData.logo = logo || null;
  if (banner !== undefined) updateData.banner = banner || null;

  // Troca de senha
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: 'Senha atual obrigatória para trocar senha' }, { status: 400 });
    }
    const provider = await prisma.provider.findUnique({ where: { id: auth.providerId } });
    if (!provider) return NextResponse.json({ error: 'Provedor não encontrado' }, { status: 404 });

    const valid = await comparePassword(currentPassword, provider.password);
    if (!valid) return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 401 });

    updateData.password = await hashPassword(newPassword);
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'Nenhum dado para atualizar' }, { status: 400 });
  }

  await prisma.provider.update({ where: { id: auth.providerId }, data: updateData });
  return NextResponse.json({ success: true });
}
