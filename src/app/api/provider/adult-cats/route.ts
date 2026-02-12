import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/provider/adult-cats?tipo=tv|filme|serie
export async function GET(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const tipo = req.nextUrl.searchParams.get('tipo');
  const tiposValidos = ['tv', 'filme', 'serie'];

  if (tipo && !tiposValidos.includes(tipo)) {
    return NextResponse.json({ error: 'Tipo inválido. Use: tv, filme ou serie' }, { status: 400 });
  }

  const where: Record<string, unknown> = {
    providerId: auth.providerId,
    categoryType: 'adulto',
  };
  if (tipo) where.contentType = tipo;

  const categories = await prisma.providerSpecialCategory.findMany({ where });

  if (tipo) {
    // Retornar apenas IDs para o tipo específico
    const ids = [...new Set(categories.map((c: { categoryId: string }) => c.categoryId))];
    return NextResponse.json({ tipo, categorias: ids });
  }

  // Agrupar por tipo
  const result: Record<string, string[]> = { tv: [], filme: [], serie: [] };
  for (const cat of categories) {
    const t = (cat as { contentType: string }).contentType;
    if (result[t] && !result[t].includes((cat as { categoryId: string }).categoryId)) {
      result[t].push((cat as { categoryId: string }).categoryId);
    }
  }

  return NextResponse.json(result);
}
