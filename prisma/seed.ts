import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ---- Admin padrão ----
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@neuroplay.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.admin.create({
      data: {
        name: 'Administrador',
        email: adminEmail,
        password: await bcrypt.hash(adminPassword, 10),
        active: true,
      },
    });
    console.log(`✅ Admin criado: ${adminEmail}`);
  } else {
    console.log(`⏭️  Admin já existe: ${adminEmail}`);
  }

  // ---- Configurações padrão ----
  const defaultSettings = [
    { key: 'app_name', value: 'Neuro Play', description: 'Nome da aplicação', type: 'string' },
    { key: 'app_version', value: '2.0.0', description: 'Versão da aplicação', type: 'string' },
    { key: 'max_profiles', value: '5', description: 'Máximo de perfis por usuário', type: 'number' },
    { key: 'max_favorites_per_type', value: '50', description: 'Máximo de favoritos por tipo', type: 'number' },
    { key: 'max_recent_channels', value: '15', description: 'Máximo de canais recentes', type: 'number' },
    { key: 'pin_parental_padrao', value: '0000', description: 'PIN parental padrão', type: 'string' },
    { key: 'log_enabled', value: 'true', description: 'Habilitar logs do sistema', type: 'boolean' },
    { key: 'cache_ttl_minutes', value: '5', description: 'TTL do cache em minutos', type: 'number' },
  ];

  for (const setting of defaultSettings) {
    const existing = await prisma.setting.findUnique({ where: { key: setting.key } });
    if (!existing) {
      await prisma.setting.create({ data: setting });
      console.log(`✅ Setting: ${setting.key} = ${setting.value}`);
    }
  }

  // ---- Avatares padrão ----
  const defaultAvatars = [
    { name: 'Avatar 1', file: '1', category: 'geral', order: 1 },
    { name: 'Avatar 2', file: '2', category: 'geral', order: 2 },
    { name: 'Avatar 3', file: '3', category: 'geral', order: 3 },
    { name: 'Avatar 4', file: '4', category: 'geral', order: 4 },
    { name: 'Avatar 5', file: '5', category: 'geral', order: 5 },
    { name: 'Avatar 6', file: '6', category: 'geral', order: 6 },
    { name: 'Avatar 7', file: '7', category: 'geral', order: 7 },
    { name: 'Avatar 8', file: '8', category: 'geral', order: 8 },
    { name: 'Kids 1', file: 'k1', category: 'kids', order: 1 },
    { name: 'Kids 2', file: 'k2', category: 'kids', order: 2 },
    { name: 'Kids 3', file: 'k3', category: 'kids', order: 3 },
    { name: 'Kids 4', file: 'k4', category: 'kids', order: 4 },
  ];

  const avatarCount = await prisma.avatar.count();
  if (avatarCount === 0) {
    await prisma.avatar.createMany({ data: defaultAvatars });
    console.log(`✅ ${defaultAvatars.length} avatares criados`);
  } else {
    console.log(`⏭️  Avatares já existem (${avatarCount})`);
  }

  console.log('🌱 Seed concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
