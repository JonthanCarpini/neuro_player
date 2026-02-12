'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/use-admin-auth';

interface Setting {
  id: number;
  key: string;
  value: string;
  description: string;
  type: string;
}

export default function SettingsPage() {
  const { apiFetch, loading: authLoading } = useAdminAuth();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading) loadSettings();
  }, [authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadSettings() {
    setLoading(true);
    const data = await apiFetch('/api/admin/settings');
    if (data) setSettings(data);
    setLoading(false);
  }

  function startEdit(s: Setting) {
    setEditingKey(s.key);
    setEditValue(s.value);
  }

  function cancelEdit() {
    setEditingKey(null);
    setEditValue('');
  }

  async function saveEdit(key: string) {
    setSaving(true);
    await apiFetch('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ key, value: editValue }),
    });
    setSaving(false);
    setEditingKey(null);
    loadSettings();
  }

  if (loading) {
    return <div className="text-gray-400">Carregando configurações...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Configurações</h1>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="text-left px-4 py-3 font-medium">Chave</th>
              <th className="text-left px-4 py-3 font-medium">Valor</th>
              <th className="text-left px-4 py-3 font-medium">Descrição</th>
              <th className="text-left px-4 py-3 font-medium">Tipo</th>
              <th className="text-right px-4 py-3 font-medium">Ação</th>
            </tr>
          </thead>
          <tbody>
            {settings.map((s) => (
              <tr key={s.key} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                <td className="px-4 py-3 text-blue-400 font-mono text-xs">{s.key}</td>
                <td className="px-4 py-3">
                  {editingKey === s.key ? (
                    <div className="flex items-center gap-2">
                      {s.type === 'boolean' ? (
                        <select
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="true">true</option>
                          <option value="false">false</option>
                        </select>
                      ) : (
                        <input
                          type={s.type === 'number' ? 'number' : 'text'}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-48 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      )}
                      <button
                        onClick={() => saveEdit(s.key)}
                        disabled={saving}
                        className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                      >
                        {saving ? '...' : 'OK'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <span className="text-white">{s.value}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{s.description}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{s.type}</td>
                <td className="px-4 py-3 text-right">
                  {editingKey !== s.key && (
                    <button
                      onClick={() => startEdit(s)}
                      className="text-blue-400 hover:text-blue-300 text-xs"
                    >
                      Editar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
