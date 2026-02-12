'use client';

import { useEffect, useState, useCallback } from 'react';
import { useProviderAuth } from '@/lib/use-provider-auth';

interface Message {
  id: number;
  title: string;
  content: string;
  type: string;
  active: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

const MSG_TYPES = ['info', 'alerta', 'urgente', 'promocao'];

export default function MessagesPage() {
  const { apiFetch } = useProviderAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', type: 'info', startDate: '', endDate: '' });
  const [saving, setSaving] = useState(false);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    const data = await apiFetch('/api/panel/messages');
    if (data) setMessages(data);
    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadMessages(); }, [loadMessages]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await apiFetch('/api/panel/messages', {
      method: 'POST',
      body: JSON.stringify({
        ...form,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      }),
    });
    setSaving(false);
    setShowModal(false);
    loadMessages();
  }

  async function handleToggle(m: Message) {
    await apiFetch('/api/panel/messages', { method: 'PUT', body: JSON.stringify({ id: m.id, active: !m.active }) });
    loadMessages();
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover esta mensagem?')) return;
    await apiFetch('/api/panel/messages', { method: 'DELETE', body: JSON.stringify({ id }) });
    loadMessages();
  }

  const typeColors: Record<string, string> = {
    info: 'bg-blue-500/20 text-blue-400',
    alerta: 'bg-yellow-500/20 text-yellow-400',
    urgente: 'bg-red-500/20 text-red-400',
    promocao: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Mensagens</h1>
        <button onClick={() => { setForm({ title: '', content: '', type: 'info', startDate: '', endDate: '' }); setShowModal(true); }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
          + Nova Mensagem
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400">Carregando...</div>
      ) : messages.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center text-gray-400">Nenhuma mensagem</div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium">{m.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[m.type] || 'text-gray-400'}`}>{m.type}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${m.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {m.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{m.content}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    {m.startDate && <span>Início: {new Date(m.startDate).toLocaleDateString('pt-BR')}</span>}
                    {m.endDate && <span>Fim: {new Date(m.endDate).toLocaleDateString('pt-BR')}</span>}
                    <span>Criada: {new Date(m.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => handleToggle(m)} className="text-blue-400 hover:text-blue-300 text-xs">{m.active ? 'Desativar' : 'Ativar'}</button>
                  <button onClick={() => handleDelete(m.id)} className="text-red-400 hover:text-red-300 text-xs">Excluir</button>
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
              <h2 className="text-lg font-semibold text-white">Nova Mensagem</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Título</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Conteúdo</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={3} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Tipo</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {MSG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Data Início</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Data Fim</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
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
