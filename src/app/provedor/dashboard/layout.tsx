'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProviderAuth } from '@/lib/use-provider-auth';

const NAV_ITEMS = [
  { href: '/provedor/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/provedor/dashboard/urls', label: 'URLs IPTV', icon: '🔗' },
  { href: '/provedor/dashboard/highlights', label: 'Destaques', icon: '⭐' },
  { href: '/provedor/dashboard/categories', label: 'Categorias', icon: '📂' },
  { href: '/provedor/dashboard/messages', label: 'Mensagens', icon: '💬' },
  { href: '/provedor/dashboard/news', label: 'Novidades', icon: '📰' },
  { href: '/provedor/dashboard/profile', label: 'Meu Perfil', icon: '👤' },
];

export default function ProviderDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useProviderAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">Neuro Play</h1>
          <p className="text-xs text-emerald-400 mt-1">Painel Provedor</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0) || 'P'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">#{user?.code}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
