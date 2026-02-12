'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProviderUser {
  id: number;
  code: string;
  name: string;
  email: string;
  logo: string | null;
  role: string;
}

export function useProviderAuth() {
  const router = useRouter();
  const [user, setUser] = useState<ProviderUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('provider_token');
    const storedUser = localStorage.getItem('provider_user');

    if (!storedToken || !storedUser) {
      router.push('/provedor');
      return;
    }

    try {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    } catch {
      router.push('/provedor');
      return;
    }

    setLoading(false);
  }, [router]);

  function logout() {
    localStorage.removeItem('provider_token');
    localStorage.removeItem('provider_refresh');
    localStorage.removeItem('provider_user');
    router.push('/provedor');
  }

  async function apiFetch(url: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      logout();
      return null;
    }

    return res.json();
  }

  return { user, token, loading, logout, apiFetch };
}
