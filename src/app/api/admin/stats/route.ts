import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/auth';

// GET /api/admin/stats — estatísticas do dashboard
export async function GET(req: NextRequest) {
  const auth = getAdminFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const [
    totalProviders,
    activeProviders,
    totalUsers,
    activeUsersToday,
    totalProfiles,
    pendingPayments,
  ] = await Promise.all([
    prisma.provider.count(),
    prisma.provider.count({ where: { active: true } }),
    prisma.user.count(),
    prisma.user.count({
      where: {
        lastLogin: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.profile.count({ where: { active: true } }),
    prisma.finance.count({ where: { status: 'pendente' } }),
  ]);

  // Últimos 7 dias de logins
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentLogins = await prisma.user.count({
    where: { lastLogin: { gte: sevenDaysAgo } },
  });

  // Top 5 provedores por usuários
  const topProviders = await prisma.provider.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      _count: { select: { users: true } },
    },
    orderBy: { users: { _count: 'desc' } },
    take: 5,
  });

  return NextResponse.json({
    totalProviders,
    activeProviders,
    totalUsers,
    activeUsersToday,
    totalProfiles,
    pendingPayments,
    recentLogins,
    topProviders: topProviders.map((p: { id: number; name: string; code: string; _count: { users: number } }) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      usersCount: p._count.users,
    })),
  });
}
