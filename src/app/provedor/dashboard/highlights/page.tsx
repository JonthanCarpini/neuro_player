'use client';

import { useEffect, useState, useCallback } from 'react';
import { useProviderAuth } from '@/lib/use-provider-auth';

interface Highlight {
  id: number;
  type: string;
  categoryName: string;
  categoryId: string;
  logoUrl: string;
  order: number;
  active: boolean;
}

export default function HighlightsPage() {
  const { apiFetch } = useProviderAuth();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: 'series', categoryName: '', categoryId: '', logoUrl: '', order: 0 });
  const [saving, setSaving] = useState(false);

  const loadHighlights = useCallback(async () => {
    setLoading(true);
    const params = typeFilter ? `?type=${typeFilter}` : '';
    const data = await apiFetch(`/api/panel/highlights${params}`);
    if (data) setHighlights(data);
    setLoading(false);
  }, [typeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadHighlights(); }, [loadHighlights]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await apiFetch('/api/panel/highlights', { method: 'POST', body: JSON.stringify(form) });
    setSaving(false);
    setShowModal(false);
    loadHighlights();
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover este destaque?')) return;
    await apiFetch('/api/panel/highlights', { method: 'DELETE', body: JSON.stringify({ id }) });
    loadHighlights();
  }

  async function handleToggle(h: Highlight) {
    await apiFetch('/api/panel/highlights', { method: 'PUT', body: JSON.stringify({ id: h.id, active: !h.active }) });
    loadHighlights();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Destaques</h1>
        <button onClick={() => { setForm({ type: 'series', categoryName: '', categoryId: '', logoUrl: '', order: 0 }); setShowModal(true); }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
          + Novo Destaque
        </button>
      </div>

      <div className="mb-4">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">Todos os tipos</option>
          <option value="series">Séries</option>
          <option value="filmes">Filmes</option>
        </select>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="text-left px-4 py-3 font-medium">Logo</th>
              <th className="text-left px-4 py-3 font-medium">Categoria</th>
              <th className="text-center px-4 py-3 font-medium">Tipo</th>
              <th className="text-center px-4 py-3 font-medium">Ordem</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Carregando...</td></tr>
            ) : highlights.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Nenhum destaque</td></tr>
            ) : (
              highlights.map((h) => (
                <tr key={h.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="px-4 py-3">
                    {h.logoUrl ? (
                      <img src={h.logoUrl} alt={h.categoryName} className="w-10 h-10 object-contain rounded" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center text-gray-500 text-xs">—</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{h.categoryName}</p>
                    <p className="text-xs text-gray-400">ID: {h.categoryId}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${h.type === 'series' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {h.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-300">{h.order}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleToggle(h)} className={`px-2 py-1 rounded text-xs font-medium ${h.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {h.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(h.id)} className="text-red-400 hover:text-red-300 text-xs">Excluir</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Novo Destaque</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Tipo</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="series">Séries</option>
                  <option value="filmes">Filmes</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Nome da Categoria</label>
                <input type="text" value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })} required placeholder="Ex: Netflix" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">ID da Categoria (XUI)</label>
                <input type="text" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required placeholder="Ex: 123" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">URL do Logo</label>
                <input type="url" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} required placeholder="https://..." className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Ordem</label>
                <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
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
