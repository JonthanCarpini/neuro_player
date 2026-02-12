import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getProviderFromRequest } from '@/lib/auth';

// GET /api/panel/stats — estatísticas do provedor
export async function GET(req: NextRequest) {
  const auth = getProviderFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const pid = auth.providerId;
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalUsers,
    activeUsersToday,
    recentLogins,
    totalProfiles,
    totalFavorites,
    totalHighlights,
    activeMessages,
  ] = await Promise.all([
    prisma.user.count({ where: { providerId: pid } }),
    prisma.user.count({ where: { providerId: pid, lastLogin: { gte: today } } }),
    prisma.user.count({ where: { providerId: pid, lastLogin: { gte: sevenDaysAgo } } }),
    prisma.profile.count({ where: { user: { providerId: pid }, active: true } }),
    prisma.favorite.count({ where: { profile: { user: { providerId: pid } } } }),
    prisma.highlight.count({ where: { providerId: pid, active: true } }),
    prisma.providerMessage.count({ where: { providerId: pid, active: true } }),
  ]);

  return NextResponse.json({
    totalUsers,
    activeUsersToday,
    recentLogins,
    totalProfiles,
    totalFavorites,
    totalHighlights,
    activeMessages,
  });
}
