import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  signUserToken,
  signAdminToken,
  signProviderToken,
  comparePassword,
  generateRefreshToken,
} from '@/lib/auth';
import type { ProviderData } from '@/types';

const REFRESH_EXPIRES_DAYS = Number(process.env.JWT_REFRESH_EXPIRES_DAYS) || 30;

// POST /api/auth/login
// Body: { type: 'admin' | 'provedor' | 'usuario', ... }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body;

    if (!type) {
      return NextResponse.json({ error: 'Campo "type" obrigatório' }, { status: 400 });
    }

    switch (type) {
      case 'admin':
        return handleAdminLogin(body);
      case 'provedor':
        return handleProviderLogin(body);
      case 'usuario':
        return handleUserLogin(body);
      default:
        return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
    }
  } catch (err) {
    console.error('[auth/login]', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// ---- Admin Login ----
async function handleAdminLogin(body: { email?: string; password?: string }) {
  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ error: 'Email e senha obrigatórios' }, { status: 400 });
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin || !admin.active) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }

  const valid = await comparePassword(password, admin.password);
  if (!valid) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastAccess: new Date() },
  });

  const token = signAdminToken({ adminId: admin.id });
  const refreshToken = await createRefreshToken('admin', admin.id);

  return NextResponse.json({
    token,
    refreshToken,
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: 'admin',
    },
  });
}

// ---- Provider Login ----
async function handleProviderLogin(body: { email?: string; password?: string }) {
  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ error: 'Email e senha obrigatórios' }, { status: 400 });
  }

  const provider = await prisma.provider.findUnique({ where: { email } });
  if (!provider || !provider.active) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }

  const valid = await comparePassword(password, provider.password);
  if (!valid) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }

  const token = signProviderToken({ providerId: provider.id });
  const refreshToken = await createRefreshToken('provedor', provider.id);

  return NextResponse.json({
    token,
    refreshToken,
    user: {
      id: provider.id,
      code: provider.code,
      name: provider.name,
      email: provider.email,
      logo: provider.logo,
      banner: provider.banner,
      role: 'provedor',
    },
  });
}

// ---- User Login (WebPlayer) ----
async function handleUserLogin(body: {
  providerCode?: string;
  username?: string;
  password?: string;
}) {
  const { providerCode, username, password } = body;
  if (!providerCode || !username || !password) {
    return NextResponse.json(
      { error: 'providerCode, username e password obrigatórios' },
      { status: 400 }
    );
  }

  // 1. Buscar provedor
  const provider = await prisma.provider.findUnique({ where: { code: providerCode } });
  if (!provider || !provider.active) {
    return NextResponse.json({ error: 'Provedor não encontrado ou inativo' }, { status: 404 });
  }

  // 2. Autenticar no XUI (tentar URLs em ordem)
  const urls = [provider.urlPrimary, provider.urlBackup1, provider.urlBackup2].filter(Boolean);
  let authResult = null;
  let usedUrl = '';

  for (const baseUrl of urls) {
    try {
      const url = `${baseUrl!.replace(/\/$/, '')}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(tid);

      if (res.ok) {
        const data = await res.json();
        if (data.user_info?.auth === 1) {
          authResult = data;
          usedUrl = baseUrl!;
          break;
        }
      }
    } catch {
      continue;
    }
  }

  if (!authResult) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }

  const userInfo = authResult.user_info;
  if (userInfo.status === 'Expired') {
    return NextResponse.json({ error: 'Conta expirada' }, { status: 401 });
  }
  if (userInfo.status === 'Banned') {
    return NextResponse.json({ error: 'Conta banida' }, { status: 401 });
  }

  // 3. Upsert usuário local
  const providerData: ProviderData = {
    password,
    base_url: usedUrl.replace(/\/$/, ''),
    user_info: userInfo,
  };

  const user = await prisma.user.upsert({
    where: {
      providerId_providerLogin: {
        providerId: provider.id,
        providerLogin: username,
      },
    },
    update: {
      lastLogin: new Date(),
      active: true,
      providerData: providerData as object,
      name: userInfo.username || username,
    },
    create: {
      providerId: provider.id,
      providerCode: provider.code,
      providerLogin: username,
      name: userInfo.username || username,
      providerData: providerData as object,
    },
  });

  // 4. Garantir perfil principal
  let profiles = await prisma.profile.findMany({
    where: { userId: user.id, active: true },
    orderBy: { createdAt: 'asc' },
  });

  if (profiles.length === 0) {
    const defaultProfile = await prisma.profile.create({
      data: {
        userId: user.id,
        name: username,
        avatar: '1',
        type: 'principal',
      },
    });
    profiles = [defaultProfile];
  }

  // 5. Gerar tokens
  const token = signUserToken({
    userId: Number(user.id),
    providerId: provider.id,
    providerLogin: username,
  });
  const refreshToken = await createRefreshToken('usuario', Number(user.id));

  // 6. Buscar categorias especiais do provedor
  const specialCategories = await prisma.providerSpecialCategory.findMany({
    where: { providerId: provider.id },
  });

  const baseUrl = usedUrl.replace(/\/$/, '');

  return NextResponse.json({
    token,
    refreshToken,
    usuario: {
      id: Number(user.id),
      username: userInfo.username,
      status: userInfo.status,
      expDate: userInfo.exp_date ? Number(userInfo.exp_date) : null,
      isTrial: userInfo.is_trial,
      maxConnections: userInfo.max_connections,
      allowedOutputFormats: userInfo.allowed_output_formats || [],
      language: user.language,
      parentalActive: user.parentalActive,
    },
    provedor: {
      id: provider.id,
      code: provider.code,
      name: provider.name,
      logo: provider.logo,
      banner: provider.banner,
    },
    // Credenciais XUI — frontend monta URLs diretamente (sem proxy)
    xui: {
      baseUrl,
      username,
      password,
      // URLs prontas para o frontend usar
      apiUrl: `${baseUrl}/player_api.php`,
      liveUrl: `${baseUrl}/live/${username}/${password}`,
      movieUrl: `${baseUrl}/movie/${username}/${password}`,
      seriesUrl: `${baseUrl}/series/${username}/${password}`,
    },
    perfis: profiles.map((p: { id: bigint; name: string; avatar: string; type: string; isKid: boolean; pinProtected: boolean }) => ({
      id: Number(p.id),
      name: p.name,
      avatar: p.avatar,
      type: p.type,
      isKid: p.isKid,
      pinProtected: p.pinProtected,
    })),
    categoriasEspeciais: specialCategories.map((c: { contentType: string; categoryType: string; categoryId: string; categoryName: string }) => ({
      contentType: c.contentType,
      categoryType: c.categoryType,
      categoryId: c.categoryId,
      categoryName: c.categoryName,
    })),
    serverInfo: {
      timezone: authResult.server_info?.timezone || 'UTC',
    },
  });
}

// ---- Helper: Create Refresh Token ----
async function createRefreshToken(userType: string, userId: number): Promise<string> {
  const token = generateRefreshToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRES_DAYS);

  await prisma.refreshToken.create({
    data: { userType, userId, token, expiresAt },
  });

  return token;
}
