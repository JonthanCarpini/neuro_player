import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

const MAX_RECENT = 15;

// GET /api/user/tv-recent?profileId=X&limit=15
export async function GET(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const profileId = Number(req.nextUrl.searchParams.get('profileId'));
  if (!profileId) return NextResponse.json({ error: 'profileId obrigatório' }, { status: 400 });

  const profile = await prisma.profile.findFirst({
    where: { id: BigInt(profileId), userId: BigInt(auth.userId) },
  });
  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });

  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit')) || MAX_RECENT, MAX_RECENT);

  const recents = await prisma.tvRecent.findMany({
    where: { profileId: BigInt(profileId) },
    orderBy: { lastAccess: 'desc' },
    take: limit,
  });

  return NextResponse.json(
    recents.map((r: {
      id: bigint; channelId: string; name: string; image: string;
      group: string; totalWatched: number; lastAccess: Date; extraData: unknown;
    }) => ({
      id: Number(r.id),
      channelId: r.channelId,
      name: r.name,
      image: r.image,
      group: r.group,
      totalWatched: r.totalWatched,
      lastAccess: r.lastAccess.toISOString(),
      extraData: r.extraData,
    }))
  );
}

// POST /api/user/tv-recent — upsert canal recente (LRU de 15)
export async function POST(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { profileId, channelId, name, image, group, watchedSeconds, extraData } = await req.json();
  if (!profileId || !channelId) {
    return NextResponse.json({ error: 'profileId e channelId obrigatórios' }, { status: 400 });
  }

  const profile = await prisma.profile.findFirst({
    where: { id: BigInt(profileId), userId: BigInt(auth.userId) },
  });
  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });

  // Upsert
  const existing = await prisma.tvRecent.findUnique({
    where: {
      profileId_channelId: {
        profileId: BigInt(profileId),
        channelId: String(channelId),
      },
    },
  });

  if (existing) {
    await prisma.tvRecent.update({
      where: { id: existing.id },
      data: {
        name: name || existing.name,
        image: image || existing.image,
        group: group || existing.group,
        totalWatched: existing.totalWatched + (watchedSeconds || 0),
        lastAccess: new Date(),
        extraData: extraData || existing.extraData,
      },
    });
  } else {
    // Verificar limite LRU — remover o mais antigo se necessário
    const count = await prisma.tvRecent.count({
      where: { profileId: BigInt(profileId) },
    });

    if (count >= MAX_RECENT) {
      const oldest = await prisma.tvRecent.findFirst({
        where: { profileId: BigInt(profileId) },
        orderBy: { lastAccess: 'asc' },
      });
      if (oldest) {
        await prisma.tvRecent.delete({ where: { id: oldest.id } });
      }
    }

    await prisma.tvRecent.create({
      data: {
        profileId: BigInt(profileId),
        channelId: String(channelId),
        name: name || '',
        image: image || '',
        group: group || '',
        totalWatched: watchedSeconds || 0,
        extraData: extraData || undefined,
      },
    });
  }

  return NextResponse.json({ success: true });
}
