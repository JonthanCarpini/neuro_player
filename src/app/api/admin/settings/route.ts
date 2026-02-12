import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/auth';

// GET /api/admin/settings — listar configurações
export async function GET(req: NextRequest) {
  const auth = getAdminFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const settings = await prisma.setting.findMany({ orderBy: { key: 'asc' } });
  return NextResponse.json(settings);
}

// PUT /api/admin/settings — atualizar configuração
export async function PUT(req: NextRequest) {
  const auth = getAdminFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { key, value } = await req.json();
  if (!key) return NextResponse.json({ error: 'key obrigatória' }, { status: 400 });

  const setting = await prisma.setting.upsert({
    where: { key },
    update: { value: String(value) },
    create: { key, value: String(value) },
  });

  return NextResponse.json(setting);
}
