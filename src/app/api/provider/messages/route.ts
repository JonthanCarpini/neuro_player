import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/provider/messages — mensagens ativas do provedor
export async function GET(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const now = new Date();

  const messages = await prisma.providerMessage.findMany({
    where: {
      providerId: auth.providerId,
      active: true,
      OR: [
        { startDate: null, endDate: null },
        { startDate: { lte: now }, endDate: null },
        { startDate: null, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: { gte: now } },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(
    messages.map((m: {
      id: bigint; title: string; content: string; type: string; createdAt: Date;
    }) => ({
      id: Number(m.id),
      title: m.title,
      content: m.content,
      type: m.type,
      createdAt: m.createdAt.toISOString(),
    }))
  );
}
