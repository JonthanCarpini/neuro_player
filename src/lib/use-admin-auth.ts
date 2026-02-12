'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function useAdminAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token');
    const storedUser = localStorage.getItem('admin_user');

    if (!storedToken || !storedUser) {
      router.push('/admin');
      return;
    }

    try {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    } catch {
      router.push('/admin');
      return;
    }

    setLoading(false);
  }, [router]);

  function logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh');
    localStorage.removeItem('admin_user');
    router.push('/admin');
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
