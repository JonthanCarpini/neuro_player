'use client';

import { useEffect, useState } from 'react';
import { useProviderAuth } from '@/lib/use-provider-auth';

interface Stats {
  totalUsers: number;
  activeUsersToday: number;
  recentLogins: number;
  totalProfiles: number;
  totalFavorites: number;
  totalHighlights: number;
  activeMessages: number;
}

export default function ProviderDashboardPage() {
  const { apiFetch, loading } = useProviderAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (loading) return;
    apiFetch('/api/panel/stats').then((data) => {
      if (data) setStats(data);
    });
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!stats) {
    return <div className="text-gray-400">Carregando estatísticas...</div>;
  }

  const cards = [
    { label: 'Usuários', value: stats.totalUsers, sub: `${stats.activeUsersToday} hoje`, color: 'emerald' },
    { label: 'Logins (7d)', value: stats.recentLogins, sub: 'últimos 7 dias', color: 'cyan' },
    { label: 'Perfis', value: stats.totalProfiles, sub: 'ativos', color: 'purple' },
    { label: 'Favoritos', value: stats.totalFavorites, sub: 'total', color: 'pink' },
    { label: 'Destaques', value: stats.totalHighlights, sub: 'ativos', color: 'yellow' },
    { label: 'Mensagens', value: stats.activeMessages, sub: 'ativas', color: 'blue' },
  ];

  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    pink: 'bg-pink-500/10 border-pink-500/30 text-pink-400',
    yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className={`p-5 rounded-xl border ${colorMap[card.color]}`}>
            <p className="text-sm opacity-80">{card.label}</p>
            <p className="text-3xl font-bold mt-1">{card.value}</p>
            <p className="text-xs opacity-60 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
