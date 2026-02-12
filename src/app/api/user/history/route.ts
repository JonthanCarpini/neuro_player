import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/user/history?profileId=X&tipo=filme&limit=50
export async function GET(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const profileId = Number(req.nextUrl.searchParams.get('profileId'));
  if (!profileId) return NextResponse.json({ error: 'profileId obrigatório' }, { status: 400 });

  const profile = await prisma.profile.findFirst({
    where: { id: BigInt(profileId), userId: BigInt(auth.userId) },
  });
  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });

  const tipo = req.nextUrl.searchParams.get('tipo');
  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit')) || 50, 100);

  const where: Record<string, unknown> = { profileId: BigInt(profileId) };
  if (tipo) where.contentType = tipo;

  const history = await prisma.viewHistory.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    take: limit,
  });

  return NextResponse.json(
    history.map((h: {
      id: bigint; contentType: string; contentId: string; name: string; image: string;
      positionSeconds: number; durationSeconds: number; percentWatched: unknown;
      episodeId: string | null; season: number | null; episode: number | null;
      completed: boolean; extraData: unknown; updatedAt: Date;
    }) => ({
      id: Number(h.id),
      contentType: h.contentType,
      contentId: h.contentId,
      name: h.name,
      image: h.image,
      positionSeconds: h.positionSeconds,
      durationSeconds: h.durationSeconds,
      percentWatched: Number(h.percentWatched),
      episodeId: h.episodeId,
      season: h.season,
      episode: h.episode,
      completed: h.completed,
      extraData: h.extraData,
      updatedAt: h.updatedAt.toISOString(),
    }))
  );
}

// POST /api/user/history — upsert histórico
export async function POST(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const body = await req.json();
  const { profileId, contentType, contentId, name, image, positionSeconds, durationSeconds, episodeId, season, episode, extraData } = body;

  if (!profileId || !contentType || !contentId) {
    return NextResponse.json({ error: 'profileId, contentType e contentId obrigatórios' }, { status: 400 });
  }

  const profile = await prisma.profile.findFirst({
    where: { id: BigInt(profileId), userId: BigInt(auth.userId) },
  });
  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });

  const percent = durationSeconds > 0 ? (positionSeconds / durationSeconds) * 100 : 0;
  const completed = percent > 95;

  await prisma.viewHistory.upsert({
    where: {
      profileId_contentType_contentId_episodeId: {
        profileId: BigInt(profileId),
        contentType,
        contentId: String(contentId),
        episodeId: episodeId ? String(episodeId) : '',
      },
    },
    update: {
      name: name || '',
      image: image || '',
      positionSeconds: positionSeconds || 0,
      durationSeconds: durationSeconds || 0,
      percentWatched: percent,
      completed,
      season: season || null,
      episode: episode || null,
      extraData: extraData || undefined,
    },
    create: {
      profileId: BigInt(profileId),
      contentType,
      contentId: String(contentId),
      name: name || '',
      image: image || '',
      positionSeconds: positionSeconds || 0,
      durationSeconds: durationSeconds || 0,
      percentWatched: percent,
      completed,
      episodeId: episodeId ? String(episodeId) : '',
      season: season || null,
      episode: episode || null,
      extraData: extraData || undefined,
    },
  });

  return NextResponse.json({ success: true });
}

// DELETE /api/user/history — remover item do histórico
export async function DELETE(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { profileId, contentType, contentId } = await req.json();
  if (!profileId || !contentType || !contentId) {
    return NextResponse.json({ error: 'profileId, contentType e contentId obrigatórios' }, { status: 400 });
  }

  const profile = await prisma.profile.findFirst({
    where: { id: BigInt(profileId), userId: BigInt(auth.userId) },
  });
  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });

  await prisma.viewHistory.deleteMany({
    where: {
      profileId: BigInt(profileId),
      contentType,
      contentId: String(contentId),
    },
  });

  return NextResponse.json({ success: true });
}
