import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/user/schedules?profileId=X
export async function GET(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const profileId = Number(req.nextUrl.searchParams.get('profileId'));
  if (!profileId) return NextResponse.json({ error: 'profileId obrigatório' }, { status: 400 });

  const profile = await prisma.profile.findFirst({
    where: { id: BigInt(profileId), userId: BigInt(auth.userId) },
  });
  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });

  const schedules = await prisma.schedule.findMany({
    where: { profileId: BigInt(profileId), canceled: false },
    orderBy: { startTime: 'asc' },
  });

  return NextResponse.json(
    schedules.map((s: {
      id: bigint; channelId: string; channelName: string; channelLogo: string | null;
      programId: string; programTitle: string; programDesc: string | null;
      startTime: Date; endTime: Date; notified: boolean; notifiedAt: Date | null;
      canceled: boolean; createdAt: Date;
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
      notified: s.notified,
      createdAt: s.createdAt.toISOString(),
    }))
  );
}

// POST /api/user/schedules — criar agendamento
export async function POST(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const body = await req.json();
  const { profileId, channelId, channelName, channelLogo, programId, programTitle, programDesc, startTime, endTime } = body;

  if (!profileId || !channelId || !programId || !startTime || !endTime) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
  }

  const profile = await prisma.profile.findFirst({
    where: { id: BigInt(profileId), userId: BigInt(auth.userId) },
  });
  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });

  const schedule = await prisma.schedule.create({
    data: {
      profileId: BigInt(profileId),
      channelId: String(channelId),
      channelName: channelName || '',
      channelLogo: channelLogo || null,
      programId: String(programId),
      programTitle: programTitle || '',
      programDesc: programDesc || null,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    },
  });

  return NextResponse.json({ id: Number(schedule.id), success: true });
}

// DELETE /api/user/schedules — cancelar agendamento
export async function DELETE(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id, profileId } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

  // Verificar ownership
  const schedule = await prisma.schedule.findUnique({
    where: { id: BigInt(id) },
    include: { profile: true },
  });

  if (!schedule || Number(schedule.profile.userId) !== auth.userId) {
    return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
  }

  await prisma.schedule.update({
    where: { id: BigInt(id) },
    data: { canceled: true },
  });

  return NextResponse.json({ success: true });
}
