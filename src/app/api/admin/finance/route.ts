import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/auth';

// GET /api/admin/finance — listar registros financeiros
export async function GET(req: NextRequest) {
  const auth = getAdminFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page')) || 1);
  const limit = Math.min(50, Number(req.nextUrl.searchParams.get('limit')) || 20);
  const status = req.nextUrl.searchParams.get('status');
  const providerId = req.nextUrl.searchParams.get('providerId');

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (providerId) where.providerId = Number(providerId);

  const [items, total] = await Promise.all([
    prisma.finance.findMany({
      where,
      include: { provider: { select: { id: true, name: true, code: true } } },
      orderBy: { dueDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.finance.count({ where }),
  ]);

  return NextResponse.json({
    data: items.map((f: {
      id: bigint; providerId: number; amount: unknown; dueDate: Date;
      paymentDate: Date | null; status: string; paymentMethod: string | null;
      receipt: string | null; notes: string | null; createdAt: Date;
      provider: { id: number; name: string; code: string };
    }) => ({
      id: Number(f.id),
      providerId: f.providerId,
      providerName: f.provider.name,
      providerCode: f.provider.code,
      amount: Number(f.amount),
      dueDate: f.dueDate.toISOString().split('T')[0],
      paymentDate: f.paymentDate?.toISOString().split('T')[0] || null,
      status: f.status,
      paymentMethod: f.paymentMethod,
      receipt: f.receipt,
      notes: f.notes,
      createdAt: f.createdAt.toISOString(),
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

// POST /api/admin/finance — criar registro financeiro
export async function POST(req: NextRequest) {
  const auth = getAdminFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { providerId, amount, dueDate, status, paymentMethod, notes } = await req.json();
  if (!providerId || !amount || !dueDate) {
    return NextResponse.json({ error: 'providerId, amount e dueDate obrigatórios' }, { status: 400 });
  }

  const finance = await prisma.finance.create({
    data: {
      providerId,
      amount,
      dueDate: new Date(dueDate),
      status: status || 'pendente',
      paymentMethod: paymentMethod || null,
      notes: notes || null,
    },
  });

  return NextResponse.json({ id: Number(finance.id), success: true }, { status: 201 });
}

// PUT /api/admin/finance — atualizar registro financeiro
export async function PUT(req: NextRequest) {
  const auth = getAdminFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id, ...data } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

  if (data.dueDate) data.dueDate = new Date(data.dueDate);
  if (data.paymentDate) data.paymentDate = new Date(data.paymentDate);

  await prisma.finance.update({ where: { id: BigInt(id) }, data });
  return NextResponse.json({ success: true });
}

// DELETE /api/admin/finance — deletar registro financeiro
export async function DELETE(req: NextRequest) {
  const auth = getAdminFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

  await prisma.finance.delete({ where: { id: BigInt(id) } });
  return NextResponse.json({ success: true });
}
