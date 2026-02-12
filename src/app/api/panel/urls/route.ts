import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getProviderFromRequest } from '@/lib/auth';

// GET /api/panel/urls — URLs do provedor
export async function GET(req: NextRequest) {
  const auth = getProviderFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const provider = await prisma.provider.findUnique({
    where: { id: auth.providerId },
    select: { urlPrimary: true, urlBackup1: true, urlBackup2: true },
  });

  if (!provider) return NextResponse.json({ error: 'Provedor não encontrado' }, { status: 404 });
  return NextResponse.json(provider);
}

// PUT /api/panel/urls — atualizar URLs
export async function PUT(req: NextRequest) {
  const auth = getProviderFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { urlPrimary, urlBackup1, urlBackup2 } = await req.json();
  if (!urlPrimary) return NextResponse.json({ error: 'URL principal obrigatória' }, { status: 400 });

  await prisma.provider.update({
    where: { id: auth.providerId },
    data: {
      urlPrimary,
      urlBackup1: urlBackup1 || null,
      urlBackup2: urlBackup2 || null,
    },
  });

  return NextResponse.json({ success: true });
}
