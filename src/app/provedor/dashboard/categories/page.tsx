'use client';

import { useEffect, useState, useCallback } from 'react';
import { useProviderAuth } from '@/lib/use-provider-auth';

interface Category {
  id: number;
  contentType: string;
  categoryType: string;
  categoryId: string;
  categoryName: string;
}

const CONTENT_TYPES = ['tv', 'filme', 'serie'];
const CATEGORY_TYPES = ['adulto', 'infantil', 'destaque'];

export default function CategoriesPage() {
  const { apiFetch, loading: authLoading } = useProviderAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ contentType: 'tv', categoryType: 'adulto', categoryId: '', categoryName: '' });
  const [saving, setSaving] = useState(false);

  const loadCategories = useCallback(async () => {
    if (authLoading) return;
    setLoading(true);
    const data = await apiFetch('/api/panel/categories');
    if (data) setCategories(data);
    setLoading(false);
  }, [authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadCategories(); }, [loadCategories]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await apiFetch('/api/panel/categories', { method: 'POST', body: JSON.stringify(form) });
    setSaving(false);
    setShowModal(false);
    loadCategories();
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover esta categoria?')) return;
    await apiFetch('/api/panel/categories', { method: 'DELETE', body: JSON.stringify({ id }) });
    loadCategories();
  }

  // Agrupar por tipo
  const grouped: Record<string, Category[]> = {};
  for (const cat of categories) {
    const key = `${cat.categoryType} (${cat.contentType})`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(cat);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Categorias Especiais</h1>
        <button onClick={() => { setForm({ contentType: 'tv', categoryType: 'adulto', categoryId: '', categoryName: '' }); setShowModal(true); }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
          + Nova Categoria
        </button>
      </div>

      <p className="text-sm text-gray-400 mb-6">
        Categorias especiais são usadas para classificar conteúdo adulto, infantil ou em destaque no app.
      </p>

      {loading ? (
        <div className="text-gray-400">Carregando...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center text-gray-400">
          Nenhuma categoria especial cadastrada
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([key, cats]) => (
            <div key={key} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700 bg-gray-750">
                <h3 className="text-sm font-semibold text-white capitalize">{key}</h3>
              </div>
              <div className="divide-y divide-gray-700/50">
                {cats.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-700/30">
                    <div>
                      <p className="text-white text-sm font-medium">{cat.categoryName}</p>
                      <p className="text-xs text-gray-400">ID: {cat.categoryId}</p>
                    </div>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-400 hover:text-red-300 text-xs">Remover</button>
                  </div>
                ))}
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
              <h2 className="text-lg font-semibold text-white">Nova Categoria Especial</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Tipo de Conteúdo</label>
                  <select value={form.contentType} onChange={(e) => setForm({ ...form, contentType: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Tipo de Categoria</label>
                  <select value={form.categoryType} onChange={(e) => setForm({ ...form, categoryType: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {CATEGORY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">ID da Categoria (XUI)</label>
                <input type="text" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required placeholder="Ex: 45" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Nome da Categoria</label>
                <input type="text" value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })} required placeholder="Ex: Adulto TV" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
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
