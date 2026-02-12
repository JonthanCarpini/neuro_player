import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/auth';

// GET /api/admin/system-logs — listar logs com paginação e filtros
export async function GET(req: NextRequest) {
  const auth = getAdminFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page')) || 1);
  const limit = Math.min(100, Number(req.nextUrl.searchParams.get('limit')) || 50);
  const userType = req.nextUrl.searchParams.get('userType');
  const action = req.nextUrl.searchParams.get('action');

  const where: Record<string, unknown> = {};
  if (userType) where.userType = userType;
  if (action) where.action = { contains: action };

  const [items, total] = await Promise.all([
    prisma.systemLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.systemLog.count({ where }),
  ]);

  return NextResponse.json({
    data: items.map((l: {
      id: bigint; userType: string; userId: number; action: string;
      description: string; ipAddress: string | null; createdAt: Date; extraData: unknown;
    }) => ({
      id: Number(l.id),
      userType: l.userType,
      userId: l.userId,
      action: l.action,
      description: l.description,
      ipAddress: l.ipAddress,
      extraData: l.extraData,
      createdAt: l.createdAt.toISOString(),
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
