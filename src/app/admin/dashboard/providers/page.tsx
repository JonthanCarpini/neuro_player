'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAdminAuth } from '@/lib/use-admin-auth';

interface Provider {
  id: number;
  code: string;
  name: string;
  email: string;
  logo: string | null;
  active: boolean;
  dueDate: string | null;
  urlPrimary: string;
  createdAt: string;
  usersCount: number;
}

interface ProviderForm {
  id?: number;
  code: string;
  name: string;
  email: string;
  password: string;
  urlPrimary: string;
  urlBackup1: string;
  urlBackup2: string;
  logo: string;
  banner: string;
  dueDate: string;
  active: boolean;
}

const EMPTY_FORM: ProviderForm = {
  code: '', name: '', email: '', password: '',
  urlPrimary: '', urlBackup1: '', urlBackup2: '',
  logo: '', banner: '', dueDate: '', active: true,
};

export default function ProvidersPage() {
  const { apiFetch, loading: authLoading } = useAdminAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<ProviderForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const loadProviders = useCallback(async () => {
    if (authLoading) return;
    setLoading(true);
    const data = await apiFetch(`/api/admin/providers?page=${page}&limit=20&search=${encodeURIComponent(search)}`);
    if (data) {
      setProviders(data.data);
      setTotal(data.total);
    }
    setLoading(false);
  }, [page, search, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadProviders(); }, [loadProviders]);

  function openNew() {
    setForm(EMPTY_FORM);
    setIsEditing(false);
    setFormError('');
    setShowModal(true);
  }

  function openEdit(p: Provider) {
    setForm({
      id: p.id,
      code: p.code,
      name: p.name,
      email: p.email,
      password: '',
      urlPrimary: p.urlPrimary,
      urlBackup1: '',
      urlBackup2: '',
      logo: p.logo || '',
      banner: '',
      dueDate: p.dueDate ? p.dueDate.split('T')[0] : '',
      active: p.active,
    });
    setIsEditing(true);
    setFormError('');
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const body = { ...form };
      if (isEditing && !body.password) delete (body as Record<string, unknown>).password;

      const data = await apiFetch('/api/admin/providers', {
        method,
        body: JSON.stringify(body),
      });

      if (data?.error) {
        setFormError(data.error);
      } else {
        setShowModal(false);
        loadProviders();
      }
    } catch {
      setFormError('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Tem certeza que deseja excluir este provedor? Todos os dados serão perdidos.')) return;

    await apiFetch('/api/admin/providers', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
    loadProviders();
  }

  async function handleToggleActive(p: Provider) {
    await apiFetch('/api/admin/providers', {
      method: 'PUT',
      body: JSON.stringify({ id: p.id, active: !p.active }),
    });
    loadProviders();
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Provedores</h1>
        <button onClick={openNew} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
          + Novo Provedor
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Buscar por nome, email ou código..."
          className="w-full max-w-md px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="text-left px-4 py-3 font-medium">Código</th>
              <th className="text-left px-4 py-3 font-medium">Nome</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-center px-4 py-3 font-medium">Usuários</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Vencimento</th>
              <th className="text-right px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">Carregando...</td></tr>
            ) : providers.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">Nenhum provedor encontrado</td></tr>
            ) : (
              providers.map((p) => (
                <tr key={p.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="px-4 py-3 text-blue-400 font-mono text-xs">{p.code}</td>
                  <td className="px-4 py-3 text-white font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-gray-300">{p.email}</td>
                  <td className="px-4 py-3 text-center text-gray-300">{p.usersCount}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleActive(p)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        p.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {p.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-xs">
                    {p.dueDate ? new Date(p.dueDate).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(p)} className="text-blue-400 hover:text-blue-300 text-xs">Editar</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300 text-xs">Excluir</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700">
            <span className="text-xs text-gray-400">{total} provedores</span>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded text-xs ${
                    p === page ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">
                {isEditing ? 'Editar Provedor' : 'Novo Provedor'}
              </h2>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Código" value={form.code} onChange={(v) => setForm({ ...form, code: v })} required disabled={isEditing} placeholder="EX: PROV01" />
                <FormField label="Nome" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required placeholder="Nome do provedor" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required placeholder="email@provedor.com" />
                <FormField label={isEditing ? 'Nova Senha (vazio = manter)' : 'Senha'} type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required={!isEditing} placeholder="••••••••" />
              </div>

              <FormField label="URL Principal" value={form.urlPrimary} onChange={(v) => setForm({ ...form, urlPrimary: v })} required placeholder="http://provedor.com" />

              <div className="grid grid-cols-2 gap-4">
                <FormField label="URL Backup 1" value={form.urlBackup1} onChange={(v) => setForm({ ...form, urlBackup1: v })} placeholder="Opcional" />
                <FormField label="URL Backup 2" value={form.urlBackup2} onChange={(v) => setForm({ ...form, urlBackup2: v })} placeholder="Opcional" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Logo URL" value={form.logo} onChange={(v) => setForm({ ...form, logo: v })} placeholder="https://..." />
                <FormField label="Vencimento" type="date" value={form.dueDate} onChange={(v) => setForm({ ...form, dueDate: v })} />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="w-4 h-4 rounded bg-gray-700 border-gray-600"
                />
                <label className="text-sm text-gray-300">Ativo</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors">
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({
  label, value, onChange, type = 'text', required = false, disabled = false, placeholder = '',
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; disabled?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      />
    </div>
  );
}
