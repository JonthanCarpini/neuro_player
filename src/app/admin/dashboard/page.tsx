'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/use-admin-auth';

interface Stats {
  totalProviders: number;
  activeProviders: number;
  totalUsers: number;
  activeUsersToday: number;
  totalProfiles: number;
  pendingPayments: number;
  recentLogins: number;
  topProviders: { id: number; name: string; code: string; usersCount: number }[];
}

export default function DashboardPage() {
  const { apiFetch } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    apiFetch('/api/admin/stats').then((data) => {
      if (data) setStats(data);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!stats) {
    return <div className="text-gray-400">Carregando estatísticas...</div>;
  }

  const cards = [
    { label: 'Provedores', value: stats.totalProviders, sub: `${stats.activeProviders} ativos`, color: 'blue' },
    { label: 'Usuários', value: stats.totalUsers, sub: `${stats.activeUsersToday} hoje`, color: 'green' },
    { label: 'Perfis', value: stats.totalProfiles, sub: 'ativos', color: 'purple' },
    { label: 'Pagamentos', value: stats.pendingPayments, sub: 'pendentes', color: 'yellow' },
    { label: 'Logins (7d)', value: stats.recentLogins, sub: 'últimos 7 dias', color: 'cyan' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    green: 'bg-green-500/10 border-green-500/30 text-green-400',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`p-5 rounded-xl border ${colorMap[card.color]}`}
          >
            <p className="text-sm opacity-80">{card.label}</p>
            <p className="text-3xl font-bold mt-1">{card.value}</p>
            <p className="text-xs opacity-60 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Top Providers */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Top Provedores por Usuários</h2>
        {stats.topProviders.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhum provedor cadastrado</p>
        ) : (
          <div className="space-y-3">
            {stats.topProviders.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4">
                <span className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-xs text-gray-300 font-bold">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{p.name}</p>
                  <p className="text-xs text-gray-400">#{p.code}</p>
                </div>
                <span className="text-sm font-semibold text-blue-400">{p.usersCount} usuários</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
