import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

function jwtSign(payload: object, expiresIn: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (jwt.sign as any)(payload, JWT_SECRET, { expiresIn });
}

// ---- Payload Types ----

export interface UserJwtPayload {
  userId: number;
  providerId: number;
  providerLogin: string;
  role: 'usuario';
}

export interface AdminJwtPayload {
  adminId: number;
  role: 'admin';
}

export interface ProviderJwtPayload {
  providerId: number;
  role: 'provedor';
}

export type AnyJwtPayload = UserJwtPayload | AdminJwtPayload | ProviderJwtPayload;

// ---- Sign ----

export function signUserToken(payload: Omit<UserJwtPayload, 'role'>): string {
  return jwtSign({ ...payload, role: 'usuario' }, JWT_EXPIRES_IN);
}

export function signAdminToken(payload: Omit<AdminJwtPayload, 'role'>): string {
  return jwtSign({ ...payload, role: 'admin' }, '7d');
}

export function signProviderToken(payload: Omit<ProviderJwtPayload, 'role'>): string {
  return jwtSign({ ...payload, role: 'provedor' }, '7d');
}

// ---- Verify ----

export function verifyToken<T = AnyJwtPayload>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch {
    return null;
  }
}

// ---- Extract ----

export function extractToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) {
    return auth.slice(7);
  }
  // Fallback: query param (HLS.js compatibility)
  return req.nextUrl.searchParams.get('token');
}

// ---- Guards ----

export function getUserFromRequest(req: NextRequest): UserJwtPayload | null {
  const token = extractToken(req);
  if (!token) return null;
  const payload = verifyToken<UserJwtPayload>(token);
  if (!payload || payload.role !== 'usuario') return null;
  return payload;
}

export function getAdminFromRequest(req: NextRequest): AdminJwtPayload | null {
  const token = extractToken(req);
  if (!token) return null;
  const payload = verifyToken<AdminJwtPayload>(token);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}

export function getProviderFromRequest(req: NextRequest): ProviderJwtPayload | null {
  const token = extractToken(req);
  if (!token) return null;
  const payload = verifyToken<ProviderJwtPayload>(token);
  if (!payload || payload.role !== 'provedor') return null;
  return payload;
}

export function getAnyAuthFromRequest(req: NextRequest): AnyJwtPayload | null {
  const token = extractToken(req);
  if (!token) return null;
  return verifyToken<AnyJwtPayload>(token);
}

// ---- Password ----

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  // PHP gera hashes $2y$ mas bcryptjs só suporta $2a$/$2b$
  const normalizedHash = hash.replace(/^\$2y\$/, '$2a$');
  return bcrypt.compare(password, normalizedHash);
}

// ---- Refresh Token ----

export function generateRefreshToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
