import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getProviderFromRequest } from '@/lib/auth';

// GET /api/panel/categories — categorias especiais do provedor
export async function GET(req: NextRequest) {
  const auth = getProviderFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const categories = await prisma.providerSpecialCategory.findMany({
    where: { providerId: auth.providerId },
    orderBy: [{ contentType: 'asc' }, { categoryType: 'asc' }],
  });

  return NextResponse.json(categories);
}

// POST /api/panel/categories — adicionar categoria especial
export async function POST(req: NextRequest) {
  const auth = getProviderFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { contentType, categoryType, categoryId, categoryName } = await req.json();
  if (!contentType || !categoryType || !categoryId || !categoryName) {
    return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
  }

  const category = await prisma.providerSpecialCategory.upsert({
    where: {
      providerId_contentType_categoryType_categoryId: {
        providerId: auth.providerId,
        contentType,
        categoryType,
        categoryId: String(categoryId),
      },
    },
    update: { categoryName },
    create: {
      providerId: auth.providerId,
      contentType,
      categoryType,
      categoryId: String(categoryId),
      categoryName,
    },
  });

  return NextResponse.json(category, { status: 201 });
}

// DELETE /api/panel/categories — remover categoria especial
export async function DELETE(req: NextRequest) {
  const auth = getProviderFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

  await prisma.providerSpecialCategory.deleteMany({
    where: { id, providerId: auth.providerId },
  });

  return NextResponse.json({ success: true });
}
