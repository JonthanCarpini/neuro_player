import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/provider/news — novidades do provedor
export async function GET(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const news = await prisma.providerNews.findMany({
    where: { providerId: auth.providerId },
    orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
    take: 20,
  });

  return NextResponse.json(
    news.map((n: {
      id: bigint; title: string; description: string; image: string | null;
      link: string | null; featured: boolean; createdAt: Date;
    }) => ({
      id: Number(n.id),
      title: n.title,
      description: n.description,
      image: n.image,
      link: n.link,
      featured: n.featured,
      createdAt: n.createdAt.toISOString(),
    }))
  );
}
