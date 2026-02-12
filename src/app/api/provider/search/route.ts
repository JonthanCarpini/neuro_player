import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache, TTL } from '@/lib/cache';

// POST /api/provider/search — busca pública por código do provedor
export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: 'Código do provedor obrigatório' }, { status: 400 });
    }

    const cacheKey = `provider:${code}`;
    const cached = cache.get<unknown>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const provider = await prisma.provider.findUnique({
      where: { code: String(code).trim() },
    });

    if (!provider || !provider.active) {
      return NextResponse.json({ error: 'Provedor não encontrado ou inativo' }, { status: 404 });
    }

    const result = {
      id: provider.id,
      code: provider.code,
      name: provider.name,
      logo: provider.logo,
      banner: provider.banner,
      active: provider.active,
    };

    cache.set(cacheKey, result, TTL.PROVIDER_SEARCH);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[provider/search]', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
