'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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
  const [loading, setLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token');
    const storedUser = localStorage.getItem('admin_user');

    if (!storedToken || !storedUser) {
      router.push('/admin');
      return;
    }

    try {
      tokenRef.current = storedToken;
      setUser(JSON.parse(storedUser));
    } catch {
      router.push('/admin');
      return;
    }

    setLoading(false);
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh');
    localStorage.removeItem('admin_user');
    tokenRef.current = null;
    router.push('/admin');
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
