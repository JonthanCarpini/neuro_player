'use client';

import { useEffect, useState } from 'react';
import { useProviderAuth } from '@/lib/use-provider-auth';

export default function UrlsPage() {
  const { apiFetch, loading: authLoading } = useProviderAuth();
  const [urls, setUrls] = useState({ urlPrimary: '', urlBackup1: '', urlBackup2: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (authLoading) return;
    apiFetch('/api/panel/urls').then((data) => {
      if (data) setUrls({ urlPrimary: data.urlPrimary || '', urlBackup1: data.urlBackup1 || '', urlBackup2: data.urlBackup2 || '' });
      setLoading(false);
    });
  }, [authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const data = await apiFetch('/api/panel/urls', {
      method: 'PUT',
      body: JSON.stringify(urls),
    });

    if (data?.success) {
      setMessage('URLs salvas com sucesso!');
    } else {
      setMessage(data?.error || 'Erro ao salvar');
    }
    setSaving(false);
  }

  if (loading) return <div className="text-gray-400">Carregando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">URLs IPTV</h1>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-xl">
        <form onSubmit={handleSave} className="space-y-4">
          {message && (
            <div className={`p-3 rounded-lg text-sm ${message.includes('sucesso') ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
              {message}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">URL Principal *</label>
            <input
              type="url"
              value={urls.urlPrimary}
              onChange={(e) => setUrls({ ...urls, urlPrimary: e.target.value })}
              required
              placeholder="http://provedor.com"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">URL Backup 1</label>
            <input
              type="url"
              value={urls.urlBackup1}
              onChange={(e) => setUrls({ ...urls, urlBackup1: e.target.value })}
              placeholder="Opcional"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">URL Backup 2</label>
            <input
              type="url"
              value={urls.urlBackup2}
              onChange={(e) => setUrls({ ...urls, urlBackup2: e.target.value })}
              placeholder="Opcional"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <p className="text-xs text-gray-500">
            O sistema tentará as URLs em ordem. Se a principal falhar, usará o backup 1, depois o backup 2.
          </p>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? 'Salvando...' : 'Salvar URLs'}
          </button>
        </form>
      </div>
    </div>
  );
}
