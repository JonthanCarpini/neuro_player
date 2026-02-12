import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/user/profiles — listar perfis do usuário
export async function GET(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const profiles = await prisma.profile.findMany({
    where: { userId: BigInt(auth.userId), active: true },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(
    profiles.map((p: { id: bigint; name: string; avatar: string; type: string; isKid: boolean; pinProtected: boolean }) => ({
      id: Number(p.id),
      name: p.name,
      avatar: p.avatar,
      type: p.type,
      isKid: p.isKid,
      pinProtected: p.pinProtected,
    }))
  );
}

// POST /api/user/profiles — criar perfil
export async function POST(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { name, avatar, isKid, pin } = await req.json();
  if (!name) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 });

  const count = await prisma.profile.count({
    where: { userId: BigInt(auth.userId), active: true },
  });

  if (count >= 5) {
    return NextResponse.json({ error: 'Máximo de 5 perfis' }, { status: 400 });
  }

  const profile = await prisma.profile.create({
    data: {
      userId: BigInt(auth.userId),
      name,
      avatar: avatar || '1',
      isKid: isKid || false,
      pin: pin || null,
      pinProtected: !!pin,
      type: 'adicional',
    },
  });

  return NextResponse.json({
    id: Number(profile.id),
    name: profile.name,
    avatar: profile.avatar,
    type: profile.type,
    isKid: profile.isKid,
    pinProtected: profile.pinProtected,
  });
}

// PUT /api/user/profiles — atualizar perfil
export async function PUT(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id, name, avatar, isKid, pin } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

  // Verificar se pertence ao usuário
  const profile = await prisma.profile.findFirst({
    where: { id: BigInt(id), userId: BigInt(auth.userId) },
  });

  if (!profile) {
    return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
  }

  const updated = await prisma.profile.update({
    where: { id: BigInt(id) },
    data: {
      ...(name !== undefined && { name }),
      ...(avatar !== undefined && { avatar }),
      ...(isKid !== undefined && { isKid }),
      ...(pin !== undefined && { pin, pinProtected: !!pin }),
    },
  });

  return NextResponse.json({
    id: Number(updated.id),
    name: updated.name,
    avatar: updated.avatar,
    type: updated.type,
    isKid: updated.isKid,
    pinProtected: updated.pinProtected,
  });
}

// DELETE /api/user/profiles — soft delete perfil
export async function DELETE(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

  const profile = await prisma.profile.findFirst({
    where: { id: BigInt(id), userId: BigInt(auth.userId) },
  });

  if (!profile) {
    return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
  }

  if (profile.type === 'principal') {
    return NextResponse.json({ error: 'Não é possível excluir o perfil principal' }, { status: 400 });
  }

  await prisma.profile.update({
    where: { id: BigInt(id) },
    data: { active: false },
  });

  return NextResponse.json({ success: true });
}
