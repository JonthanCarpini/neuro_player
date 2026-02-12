import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/user/favorites?profileId=X
export async function GET(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const profileId = Number(req.nextUrl.searchParams.get('profileId'));
  if (!profileId) return NextResponse.json({ error: 'profileId obrigatório' }, { status: 400 });

  // Verificar se perfil pertence ao usuário
  const profile = await prisma.profile.findFirst({
    where: { id: BigInt(profileId), userId: BigInt(auth.userId) },
  });
  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });

  const favorites = await prisma.favorite.findMany({
    where: { profileId: BigInt(profileId) },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(
    favorites.map((f: { id: bigint; contentType: string; contentId: string; name: string; image: string; extraData: unknown; createdAt: Date }) => ({
      id: Number(f.id),
      contentType: f.contentType,
      contentId: f.contentId,
      name: f.name,
      image: f.image,
      extraData: f.extraData,
      createdAt: f.createdAt.toISOString(),
    }))
  );
}

// POST /api/user/favorites — adicionar/remover favorito (toggle)
export async function POST(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { profileId, contentType, contentId, name, image, extraData } = await req.json();
  if (!profileId || !contentType || !contentId) {
    return NextResponse.json({ error: 'profileId, contentType e contentId obrigatórios' }, { status: 400 });
  }

  // Verificar se perfil pertence ao usuário
  const profile = await prisma.profile.findFirst({
    where: { id: BigInt(profileId), userId: BigInt(auth.userId) },
  });
  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });

  // Toggle: se já existe, remove; se não, adiciona
  const existing = await prisma.favorite.findUnique({
    where: {
      profileId_contentType_contentId: {
        profileId: BigInt(profileId),
        contentType,
        contentId: String(contentId),
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ action: 'removed' });
  }

  await prisma.favorite.create({
    data: {
      profileId: BigInt(profileId),
      contentType,
      contentId: String(contentId),
      name: name || '',
      image: image || '',
      extraData: extraData || undefined,
    },
  });

  return NextResponse.json({ action: 'added' });
}

// DELETE /api/user/favorites — remover favorito por contentId
export async function DELETE(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { profileId, contentId, contentType } = await req.json();
  if (!profileId || !contentId) {
    return NextResponse.json({ error: 'profileId e contentId obrigatórios' }, { status: 400 });
  }

  const profile = await prisma.profile.findFirst({
    where: { id: BigInt(profileId), userId: BigInt(auth.userId) },
  });
  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });

  if (contentType) {
    await prisma.favorite.deleteMany({
      where: {
        profileId: BigInt(profileId),
        contentType,
        contentId: String(contentId),
      },
    });
  } else {
    await prisma.favorite.deleteMany({
      where: {
        profileId: BigInt(profileId),
        contentId: String(contentId),
      },
    });
  }

  return NextResponse.json({ success: true });
}
