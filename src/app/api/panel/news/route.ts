import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getProviderFromRequest } from '@/lib/auth';

// GET /api/panel/news — listar novidades do provedor
export async function GET(req: NextRequest) {
  const auth = getProviderFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const news = await prisma.providerNews.findMany({
    where: { providerId: auth.providerId },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json(
    news.map((n: {
      id: bigint; title: string; description: string; image: string | null;
      link: string | null; featured: boolean; order: number; createdAt: Date;
    }) => ({
      id: Number(n.id),
      title: n.title,
      description: n.description,
      image: n.image,
      link: n.link,
      featured: n.featured,
      order: n.order,
      createdAt: n.createdAt.toISOString(),
    }))
  );
}

// POST /api/panel/news — criar novidade
export async function POST(req: NextRequest) {
  const auth = getProviderFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { title, description, image, link, featured, order } = await req.json();
  if (!title || !description) {
    return NextResponse.json({ error: 'title e description obrigatórios' }, { status: 400 });
  }

  const item = await prisma.providerNews.create({
    data: {
      providerId: auth.providerId,
      title,
      description,
      image: image || null,
      link: link || null,
      featured: featured || false,
      order: order || 0,
    },
  });

  return NextResponse.json({ id: Number(item.id), success: true }, { status: 201 });
}

// PUT /api/panel/news — atualizar novidade
export async function PUT(req: NextRequest) {
  const auth = getProviderFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id, ...data } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

  const existing = await prisma.providerNews.findFirst({
    where: { id: BigInt(id), providerId: auth.providerId },
  });
  if (!existing) return NextResponse.json({ error: 'Novidade não encontrada' }, { status: 404 });

  await prisma.providerNews.update({ where: { id: BigInt(id) }, data });
  return NextResponse.json({ success: true });
}

// DELETE /api/panel/news — remover novidade
export async function DELETE(req: NextRequest) {
  const auth = getProviderFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

  await prisma.providerNews.deleteMany({
    where: { id: BigInt(id), providerId: auth.providerId },
  });

  return NextResponse.json({ success: true });
}
