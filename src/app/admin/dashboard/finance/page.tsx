'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAdminAuth } from '@/lib/use-admin-auth';

interface FinanceRecord {
  id: number;
  providerId: number;
  providerName: string;
  providerCode: string;
  amount: number;
  dueDate: string;
  paymentDate: string | null;
  status: string;
  paymentMethod: string | null;
  receipt: string | null;
  notes: string | null;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pendente: 'bg-yellow-500/20 text-yellow-400',
  pago: 'bg-green-500/20 text-green-400',
  atrasado: 'bg-red-500/20 text-red-400',
  cancelado: 'bg-gray-500/20 text-gray-400',
};

export default function FinancePage() {
  const { apiFetch } = useAdminAuth();
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'pay'>('create');
  const [selectedRecord, setSelectedRecord] = useState<FinanceRecord | null>(null);
  const [formData, setFormData] = useState({ providerId: '', amount: '', dueDate: '', notes: '' });
  const [payData, setPayData] = useState({ paymentMethod: '', paymentDate: '', receipt: '' });
  const [saving, setSaving] = useState(false);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (statusFilter) params.set('status', statusFilter);

    const data = await apiFetch(`/api/admin/finance?${params}`);
    if (data) {
      setRecords(data.data);
      setTotal(data.total);
    }
    setLoading(false);
  }, [page, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadRecords(); }, [loadRecords]);

  function openCreate() {
    setFormData({ providerId: '', amount: '', dueDate: '', notes: '' });
    setModalMode('create');
    setShowModal(true);
  }

  function openPay(r: FinanceRecord) {
    setSelectedRecord(r);
    setPayData({ paymentMethod: '', paymentDate: new Date().toISOString().split('T')[0], receipt: '' });
    setModalMode('pay');
    setShowModal(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await apiFetch('/api/admin/finance', {
      method: 'POST',
      body: JSON.stringify({
        providerId: Number(formData.providerId),
        amount: Number(formData.amount),
        dueDate: formData.dueDate,
        notes: formData.notes || null,
      }),
    });
    setSaving(false);
    setShowModal(false);
    loadRecords();
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRecord) return;
    setSaving(true);
    await apiFetch('/api/admin/finance', {
      method: 'PUT',
      body: JSON.stringify({
        id: selectedRecord.id,
        status: 'pago',
        paymentDate: payData.paymentDate,
        paymentMethod: payData.paymentMethod || null,
        receipt: payData.receipt || null,
      }),
    });
    setSaving(false);
    setShowModal(false);
    loadRecords();
  }

  async function handleDelete(id: number) {
    if (!confirm('Excluir este registro financeiro?')) return;
    await apiFetch('/api/admin/finance', { method: 'DELETE', body: JSON.stringify({ id }) });
    loadRecords();
  }

  const totalPages = Math.ceil(total / 20);

  // Totais
  const totalPendente = records.filter((r) => r.status === 'pendente').reduce((s, r) => s + r.amount, 0);
  const totalPago = records.filter((r) => r.status === 'pago').reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Financeiro</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
          + Nova Cobrança
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <p className="text-sm text-yellow-400">Pendente</p>
          <p className="text-2xl font-bold text-yellow-400">R$ {totalPendente.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <p className="text-sm text-green-400">Pago (página)</p>
          <p className="text-2xl font-bold text-green-400">R$ {totalPago.toFixed(2)}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
          <option value="atrasado">Atrasado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="text-left px-4 py-3 font-medium">Provedor</th>
              <th className="text-right px-4 py-3 font-medium">Valor</th>
              <th className="text-center px-4 py-3 font-medium">Vencimento</th>
              <th className="text-center px-4 py-3 font-medium">Pagamento</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Carregando...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Nenhum registro</td></tr>
            ) : (
              records.map((r) => (
                <tr key={r.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{r.providerName}</p>
                    <p className="text-xs text-gray-400">#{r.providerCode}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-white font-mono">R$ {r.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center text-gray-300 text-xs">{new Date(r.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3 text-center text-gray-300 text-xs">{r.paymentDate ? new Date(r.paymentDate + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[r.status] || 'text-gray-400'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {r.status === 'pendente' && (
                      <button onClick={() => openPay(r)} className="text-green-400 hover:text-green-300 text-xs">Pagar</button>
                    )}
                    <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-300 text-xs">Excluir</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700">
            <span className="text-xs text-gray-400">{total} registros</span>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded text-xs ${p === page ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">
                {modalMode === 'create' ? 'Nova Cobrança' : `Registrar Pagamento — ${selectedRecord?.providerName}`}
              </h2>
            </div>

            {modalMode === 'create' ? (
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">ID do Provedor</label>
                  <input type="number" value={formData.providerId} onChange={(e) => setFormData({ ...formData, providerId: e.target.value })} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Valor (R$)</label>
                  <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Vencimento</label>
                  <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Observações</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">Cancelar</button>
                  <button type="submit" disabled={saving} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors">{saving ? 'Salvando...' : 'Criar'}</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePay} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Data do Pagamento</label>
                  <input type="date" value={payData.paymentDate} onChange={(e) => setPayData({ ...payData, paymentDate: e.target.value })} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Método de Pagamento</label>
                  <select value={payData.paymentMethod} onChange={(e) => setPayData({ ...payData, paymentMethod: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Selecione</option>
                    <option value="pix">PIX</option>
                    <option value="boleto">Boleto</option>
                    <option value="cartao">Cartão</option>
                    <option value="transferencia">Transferência</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Comprovante (URL)</label>
                  <input type="text" value={payData.receipt} onChange={(e) => setPayData({ ...payData, receipt: e.target.value })} placeholder="Opcional" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">Cancelar</button>
                  <button type="submit" disabled={saving} className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg text-sm font-medium transition-colors">{saving ? 'Salvando...' : 'Confirmar Pagamento'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
