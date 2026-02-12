import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getProviderFromRequest } from '@/lib/auth';
import { cache } from '@/lib/cache';

// GET /api/panel/highlights — listar destaques do provedor
export async function GET(req: NextRequest) {
  const auth = getProviderFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const type = req.nextUrl.searchParams.get('type');

  const where: Record<string, unknown> = { providerId: auth.providerId };
  if (type) where.type = type;

  const highlights = await prisma.highlight.findMany({
    where,
    orderBy: { order: 'asc' },
  });

  return NextResponse.json(
    highlights.map((h: {
      id: bigint; type: string; categoryName: string; categoryId: string;
      logoUrl: string; order: number; active: boolean;
    }) => ({
      id: Number(h.id),
      type: h.type,
      categoryName: h.categoryName,
      categoryId: h.categoryId,
      logoUrl: h.logoUrl,
      order: h.order,
      active: h.active,
    }))
  );
}

// POST /api/panel/highlights — criar destaque
export async function POST(req: NextRequest) {
  const auth = getProviderFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { type, categoryName, categoryId, logoUrl, order } = await req.json();
  if (!type || !categoryName || !categoryId || !logoUrl) {
    return NextResponse.json({ error: 'type, categoryName, categoryId e logoUrl obrigatórios' }, { status: 400 });
  }

  const highlight = await prisma.highlight.create({
    data: {
      providerId: auth.providerId,
      type,
      categoryName,
      categoryId: String(categoryId),
      logoUrl,
      order: order || 0,
    },
  });

  cache.delete(`highlights:${auth.providerId}:all`);
  cache.delete(`highlights:${auth.providerId}:${type}`);

  return NextResponse.json({ id: Number(highlight.id), success: true }, { status: 201 });
}

// PUT /api/panel/highlights — atualizar destaque
export async function PUT(req: NextRequest) {
  const auth = getProviderFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id, ...data } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

  const existing = await prisma.highlight.findFirst({
    where: { id: BigInt(id), providerId: auth.providerId },
  });
  if (!existing) return NextResponse.json({ error: 'Destaque não encontrado' }, { status: 404 });

  await prisma.highlight.update({ where: { id: BigInt(id) }, data });

  cache.delete(`highlights:${auth.providerId}:all`);
  cache.delete(`highlights:${auth.providerId}:${existing.type}`);

  return NextResponse.json({ success: true });
}

// DELETE /api/panel/highlights — remover destaque
export async function DELETE(req: NextRequest) {
  const auth = getProviderFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

  const existing = await prisma.highlight.findFirst({
    where: { id: BigInt(id), providerId: auth.providerId },
  });
  if (!existing) return NextResponse.json({ error: 'Destaque não encontrado' }, { status: 404 });

  await prisma.highlight.delete({ where: { id: BigInt(id) } });

  cache.delete(`highlights:${auth.providerId}:all`);
  cache.delete(`highlights:${auth.providerId}:${existing.type}`);

  return NextResponse.json({ success: true });
}
