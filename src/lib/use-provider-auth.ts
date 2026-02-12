'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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
  const [loading, setLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('provider_token');
    const storedUser = localStorage.getItem('provider_user');

    if (!storedToken || !storedUser) {
      router.push('/provedor');
      return;
    }

    try {
      tokenRef.current = storedToken;
      setUser(JSON.parse(storedUser));
    } catch {
      router.push('/provedor');
      return;
    }

    setLoading(false);
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('provider_token');
    localStorage.removeItem('provider_refresh');
    localStorage.removeItem('provider_user');
    tokenRef.current = null;
    router.push('/provedor');
  }, [router]);

  const apiFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const t = tokenRef.current;
    if (!t) return null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    headers['Authorization'] = `Bearer ${t}`;

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      logout();
      return null;
    }

    return res.json();
  }, [logout]);

  return { user, token: tokenRef.current, loading, logout, apiFetch };
}
