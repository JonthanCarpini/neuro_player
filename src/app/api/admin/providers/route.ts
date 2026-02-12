import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest, hashPassword } from '@/lib/auth';

// GET /api/admin/providers — listar provedores (com paginação)
export async function GET(req: NextRequest) {
  const auth = getAdminFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page')) || 1);
  const limit = Math.min(50, Number(req.nextUrl.searchParams.get('limit')) || 20);
  const search = req.nextUrl.searchParams.get('search') || '';

  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { code: { contains: search } },
        ],
      }
    : {};

  const [providers, total] = await Promise.all([
    prisma.provider.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        code: true,
        name: true,
        email: true,
        logo: true,
        active: true,
        dueDate: true,
        urlPrimary: true,
        createdAt: true,
        _count: { select: { users: true } },
      },
    }),
    prisma.provider.count({ where }),
  ]);

  return NextResponse.json({
    data: providers.map((p: Record<string, unknown> & { _count: { users: number } }) => ({
      ...p,
      usersCount: p._count.users,
      _count: undefined,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

// POST /api/admin/providers — criar provedor
export async function POST(req: NextRequest) {
  const auth = getAdminFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const body = await req.json();
  const { code, name, email, password, urlPrimary, urlBackup1, urlBackup2, logo, banner, dueDate } = body;

  if (!code || !name || !email || !password || !urlPrimary) {
    return NextResponse.json({ error: 'code, name, email, password e urlPrimary obrigatórios' }, { status: 400 });
  }

  // Verificar duplicatas
  const existingCode = await prisma.provider.findUnique({ where: { code } });
  if (existingCode) return NextResponse.json({ error: 'Código já em uso' }, { status: 409 });

  const existingEmail = await prisma.provider.findUnique({ where: { email } });
  if (existingEmail) return NextResponse.json({ error: 'Email já em uso' }, { status: 409 });

  const provider = await prisma.provider.create({
    data: {
      code,
      name,
      email,
      password: await hashPassword(password),
      urlPrimary,
      urlBackup1: urlBackup1 || null,
      urlBackup2: urlBackup2 || null,
      logo: logo || null,
      banner: banner || null,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  return NextResponse.json(provider, { status: 201 });
}

// PUT /api/admin/providers — atualizar provedor
export async function PUT(req: NextRequest) {
  const auth = getAdminFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

  const existing = await prisma.provider.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Provedor não encontrado' }, { status: 404 });

  // Se mudar senha, hashear
  if (data.password) {
    data.password = await hashPassword(data.password);
  } else {
    delete data.password;
  }

  if (data.dueDate) data.dueDate = new Date(data.dueDate);

  const updated = await prisma.provider.update({ where: { id }, data });
  return NextResponse.json(updated);
}

// DELETE /api/admin/providers — deletar provedor
export async function DELETE(req: NextRequest) {
  const auth = getAdminFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

  await prisma.provider.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
