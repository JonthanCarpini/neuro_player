import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache, TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// GET /api/user/avatars — listar avatares disponíveis (público, com cache)
export async function GET() {
  const cacheKey = 'avatars:all';
  const cached = cache.get<unknown[]>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const avatars = await prisma.avatar.findMany({
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  });

  const result = avatars.map((a: { id: number; name: string; file: string; category: string; order: number }) => ({
    id: a.id,
    name: a.name,
    file: a.file,
    category: a.category,
    order: a.order,
  }));

  cache.set(cacheKey, result, TTL.AVATARS);
  return NextResponse.json(result);
}
