'use client';

import { useEffect, useState, useCallback } from 'react';
import { useProviderAuth } from '@/lib/use-provider-auth';

interface NewsItem {
  id: number;
  title: string;
  description: string;
  image: string | null;
  link: string | null;
  featured: boolean;
  order: number;
  createdAt: string;
}

export default function NewsPage() {
  const { apiFetch, loading: authLoading } = useProviderAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', image: '', link: '', featured: false, order: 0 });
  const [saving, setSaving] = useState(false);

  const loadNews = useCallback(async () => {
    if (authLoading) return;
    setLoading(true);
    const data = await apiFetch('/api/panel/news');
    if (data) setNews(data);
    setLoading(false);
  }, [authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadNews(); }, [loadNews]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await apiFetch('/api/panel/news', {
      method: 'POST',
      body: JSON.stringify({ ...form, image: form.image || null, link: form.link || null }),
    });
    setSaving(false);
    setShowModal(false);
    loadNews();
  }

  async function handleToggleFeatured(n: NewsItem) {
    await apiFetch('/api/panel/news', { method: 'PUT', body: JSON.stringify({ id: n.id, featured: !n.featured }) });
    loadNews();
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover esta novidade?')) return;
    await apiFetch('/api/panel/news', { method: 'DELETE', body: JSON.stringify({ id }) });
    loadNews();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Novidades</h1>
        <button onClick={() => { setForm({ title: '', description: '', image: '', link: '', featured: false, order: 0 }); setShowModal(true); }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
          + Nova Novidade
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400">Carregando...</div>
      ) : news.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center text-gray-400">Nenhuma novidade</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {news.map((n) => (
            <div key={n.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              {n.image && (
                <img src={n.image} alt={n.title} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-white font-medium flex-1">{n.title}</h3>
                  {n.featured && (
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">Destaque</span>
                  )}
                </div>
                <p className="text-sm text-gray-300 mb-3 line-clamp-2">{n.description}</p>
                {n.link && <a href={n.link} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:underline">{n.link}</a>}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                  <span className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleDateString('pt-BR')}</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleToggleFeatured(n)} className="text-yellow-400 hover:text-yellow-300 text-xs">
                      {n.featured ? 'Remover destaque' : 'Destacar'}
                    </button>
                    <button onClick={() => handleDelete(n.id)} className="text-red-400 hover:text-red-300 text-xs">Excluir</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Nova Novidade</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Título</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Descrição</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Imagem (URL)</label>
                <input type="url" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Opcional" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Link</label>
                <input type="url" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="Opcional" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Ordem</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 rounded bg-gray-700 border-gray-600" />
                    Destaque
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white rounded-lg text-sm font-medium transition-colors">{saving ? 'Salvando...' : 'Criar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
