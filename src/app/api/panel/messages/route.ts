import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getProviderFromRequest } from '@/lib/auth';

// GET /api/panel/messages — listar mensagens do provedor
export async function GET(req: NextRequest) {
  const auth = getProviderFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const messages = await prisma.providerMessage.findMany({
    where: { providerId: auth.providerId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(
    messages.map((m: {
      id: bigint; title: string; content: string; type: string;
      active: boolean; startDate: Date | null; endDate: Date | null; createdAt: Date;
    }) => ({
      id: Number(m.id),
      title: m.title,
      content: m.content,
      type: m.type,
      active: m.active,
      startDate: m.startDate?.toISOString() || null,
      endDate: m.endDate?.toISOString() || null,
      createdAt: m.createdAt.toISOString(),
    }))
  );
}

// POST /api/panel/messages — criar mensagem
export async function POST(req: NextRequest) {
  const auth = getProviderFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { title, content, type, startDate, endDate } = await req.json();
  if (!title || !content) {
    return NextResponse.json({ error: 'title e content obrigatórios' }, { status: 400 });
  }

  const message = await prisma.providerMessage.create({
    data: {
      providerId: auth.providerId,
      title,
      content,
      type: type || 'info',
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  return NextResponse.json({ id: Number(message.id), success: true }, { status: 201 });
}

// PUT /api/panel/messages — atualizar mensagem
export async function PUT(req: NextRequest) {
  const auth = getProviderFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id, ...data } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

  const existing = await prisma.providerMessage.findFirst({
    where: { id: BigInt(id), providerId: auth.providerId },
  });
  if (!existing) return NextResponse.json({ error: 'Mensagem não encontrada' }, { status: 404 });

  if (data.startDate) data.startDate = new Date(data.startDate);
  if (data.endDate) data.endDate = new Date(data.endDate);

  await prisma.providerMessage.update({ where: { id: BigInt(id) }, data });
  return NextResponse.json({ success: true });
}

// DELETE /api/panel/messages — remover mensagem
export async function DELETE(req: NextRequest) {
  const auth = getProviderFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

  await prisma.providerMessage.deleteMany({
    where: { id: BigInt(id), providerId: auth.providerId },
  });

  return NextResponse.json({ success: true });
}
