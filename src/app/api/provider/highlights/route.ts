import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { cache, TTL } from '@/lib/cache';

// GET /api/provider/highlights?type=series|filmes|kids|all
export async function GET(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const type = req.nextUrl.searchParams.get('type') || 'all';
  const cacheKey = `highlights:${auth.providerId}:${type}`;
  const cached = cache.get<unknown>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const result: Record<string, unknown> = {};

  if (type === 'all' || type === 'series' || type === 'filmes') {
    const where: Record<string, unknown> = { providerId: auth.providerId, active: true };
    if (type !== 'all') where.type = type;

    const highlights = await prisma.highlight.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    if (type === 'all') {
      result.series = highlights
        .filter((h: { type: string }) => h.type === 'series')
        .map((h: { id: bigint; categoryName: string; categoryId: string; logoUrl: string; order: number }) => ({
          id: Number(h.id),
          categoryName: h.categoryName,
          categoryId: h.categoryId,
          logoUrl: h.logoUrl,
          order: h.order,
        }));
      result.filmes = highlights
        .filter((h: { type: string }) => h.type === 'filmes')
        .map((h: { id: bigint; categoryName: string; categoryId: string; logoUrl: string; order: number }) => ({
          id: Number(h.id),
          categoryName: h.categoryName,
          categoryId: h.categoryId,
          logoUrl: h.logoUrl,
          order: h.order,
        }));
    } else {
      result[type] = highlights.map((h: { id: bigint; categoryName: string; categoryId: string; logoUrl: string; order: number }) => ({
        id: Number(h.id),
        categoryName: h.categoryName,
        categoryId: h.categoryId,
        logoUrl: h.logoUrl,
        order: h.order,
      }));
    }
  }

  if (type === 'all' || type === 'kids') {
    const kidsHighlights = await prisma.kidsHighlight.findMany({
      where: { providerId: auth.providerId, active: true },
      orderBy: { order: 'asc' },
    });

    result.kids = kidsHighlights.map((k: {
      id: number; contentType: string; contentId: number; providerName: string;
      categoryId: string; logoUrl: string; order: number;
    }) => ({
      id: k.id,
      contentType: k.contentType,
      contentId: k.contentId,
      providerName: k.providerName,
      categoryId: k.categoryId,
      logoUrl: k.logoUrl,
      order: k.order,
    }));
  }

  cache.set(cacheKey, result, TTL.HIGHLIGHTS);
  return NextResponse.json(result);
}
