import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const migrationPath = join(__dirname, '../prisma/migrations/20260616170329_add_team_teaching_tracking/migration.sql');

console.log('🔧 Applying team teaching migration via Prisma...');

const prisma = new PrismaClient();

try {
  const migration = readFileSync(migrationPath, 'utf-8');
  
  // Clean up comments and split statements
  const statements = migration
    .split('\n')
    .filter(line => !line.trim().startsWith('--') && line.trim())
    .join('\n')
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  console.log(`\n📝 Executing ${statements.length} SQL statements...\n`);
  
  for (const stmt of statements) {
    console.log('→', stmt.substring(0, 70) + '...');
    await prisma.$executeRawUnsafe(stmt);
  }
  
  console.log('\n✅ Migration applied successfully!');
  console.log('✅ Added lastUpdatedBy to NilaiMahasiswa');
  console.log('✅ Added updatedAt to NilaiMahasiswa');
  console.log('✅ Team teaching tracking is now enabled!');
  
} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
