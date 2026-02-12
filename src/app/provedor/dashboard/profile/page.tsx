'use client';

import { useEffect, useState } from 'react';
import { useProviderAuth } from '@/lib/use-provider-auth';

interface ProviderProfile {
  id: number;
  code: string;
  name: string;
  email: string;
  logo: string | null;
  banner: string | null;
  urlPrimary: string;
  urlBackup1: string | null;
  urlBackup2: string | null;
  active: boolean;
  dueDate: string | null;
  createdAt: string;
  usersCount: number;
}

export default function ProfilePage() {
  const { apiFetch, loading: authLoading } = useProviderAuth();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit form
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [banner, setBanner] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Password
  const [showPassForm, setShowPassForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMessage, setPassMessage] = useState('');
  const [passSaving, setPassSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    apiFetch('/api/panel/profile').then((data) => {
      if (data) {
        setProfile(data);
        setName(data.name);
        setLogo(data.logo || '');
        setBanner(data.banner || '');
      }
      setLoading(false);
    });
  }, [authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const data = await apiFetch('/api/panel/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, logo: logo || null, banner: banner || null }),
    });

    if (data?.success) {
      setMessage('Perfil atualizado!');
      // Atualizar localStorage
      const stored = localStorage.getItem('provider_user');
      if (stored) {
        const user = JSON.parse(stored);
        user.name = name;
        user.logo = logo || null;
        localStorage.setItem('provider_user', JSON.stringify(user));
      }
    } else {
      setMessage(data?.error || 'Erro ao salvar');
    }
    setSaving(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPassSaving(true);
    setPassMessage('');

    const data = await apiFetch('/api/panel/profile', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (data?.success) {
      setPassMessage('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setShowPassForm(false);
    } else {
      setPassMessage(data?.error || 'Erro ao alterar senha');
    }
    setPassSaving(false);
  }

  if (loading) return <div className="text-gray-400">Carregando...</div>;
  if (!profile) return <div className="text-red-400">Erro ao carregar perfil</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Meu Perfil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Info Card */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Informações</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Código</span>
              <span className="text-white font-mono">{profile.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span className="text-white">{profile.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span className={profile.active ? 'text-green-400' : 'text-red-400'}>{profile.active ? 'Ativo' : 'Inativo'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Usuários</span>
              <span className="text-white">{profile.usersCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Vencimento</span>
              <span className="text-white">{profile.dueDate ? new Date(profile.dueDate).toLocaleDateString('pt-BR') : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Cadastrado em</span>
              <span className="text-white">{new Date(profile.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Editar Perfil</h2>

          <form onSubmit={handleSave} className="space-y-4">
            {message && (
              <div className={`p-3 rounded-lg text-sm ${message.includes('atualizado') ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                {message}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Nome</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Logo URL</label>
              <input type="url" value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Banner URL</label>
              <input type="url" value={banner} onChange={(e) => setBanner(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white rounded-lg text-sm font-medium transition-colors">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </form>

          {/* Change Password */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            {!showPassForm ? (
              <button onClick={() => setShowPassForm(true)} className="text-sm text-emerald-400 hover:text-emerald-300">
                Alterar senha
              </button>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-3">
                {passMessage && (
                  <div className={`p-2 rounded text-xs ${passMessage.includes('sucesso') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {passMessage}
                  </div>
                )}
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required placeholder="Senha atual" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="Nova senha" minLength={6} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setShowPassForm(false); setPassMessage(''); }} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs transition-colors">Cancelar</button>
                  <button type="submit" disabled={passSaving} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white rounded-lg text-xs font-medium transition-colors">{passSaving ? '...' : 'Alterar'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
