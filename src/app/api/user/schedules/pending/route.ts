import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/user/schedules/pending?profileId=X
// Retorna agendamentos que começam nos próximos 5 minutos e ainda não foram notificados
export async function GET(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const profileId = Number(req.nextUrl.searchParams.get('profileId'));
  if (!profileId) return NextResponse.json({ error: 'profileId obrigatório' }, { status: 400 });

  const profile = await prisma.profile.findFirst({
    where: { id: BigInt(profileId), userId: BigInt(auth.userId) },
  });
  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });

  const now = new Date();
  const fiveMinLater = new Date(now.getTime() + 5 * 60 * 1000);

  const pending = await prisma.schedule.findMany({
    where: {
      profileId: BigInt(profileId),
      canceled: false,
      notified: false,
      startTime: { lte: fiveMinLater, gte: now },
    },
    orderBy: { startTime: 'asc' },
  });

  // Marcar como notificados
  if (pending.length > 0) {
    await prisma.schedule.updateMany({
      where: { id: { in: pending.map((p: { id: bigint }) => p.id) } },
      data: { notified: true, notifiedAt: now },
    });
  }

  return NextResponse.json(
    pending.map((s: {
      id: bigint; channelId: string; channelName: string; channelLogo: string | null;
      programId: string; programTitle: string; programDesc: string | null;
      startTime: Date; endTime: Date;
    }) => ({
      id: Number(s.id),
      channelId: s.channelId,
      channelName: s.channelName,
      channelLogo: s.channelLogo,
      programId: s.programId,
      programTitle: s.programTitle,
      programDesc: s.programDesc,
      startTime: s.startTime.toISOString(),
      endTime: s.endTime.toISOString(),
    }))
  );
}
