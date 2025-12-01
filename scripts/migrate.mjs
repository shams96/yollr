import pg from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase connection details
const SUPABASE_URL = 'https://dklpoxigmpcjjynmbtga.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrbHBveGlnbXBjamp5bm1idGdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDAzMzM0OCwiZXhwIjoyMDc5NjA5MzQ4fQ.J9NWfC_5csqlFEHSTiKGPrc5ByIc9pZHT1-0ca2tbgQ';

// Extract project ref from URL
const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)[1];

// Construct database connection string
// Format: postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
// Note: We need the database password, which isn't the service key

console.log('🚨 Direct database connection requires the database password.');
console.log('The SERVICE_ROLE_KEY is not the database password.\n');

console.log('📋 Alternative: Use Supabase SQL Editor\n');

console.log('✅ Quick Steps:');
console.log('1. Open: https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
console.log('2. Copy ALL content from: APPLY_MIGRATION.sql');
console.log('3. Paste and click "Run"');
console.log('4. Done! (~10 seconds)\n');

console.log('📄 Migration file location:');
console.log('   ' + join(__dirname, '../APPLY_MIGRATION.sql'));
console.log('');

// Show file preview
const migrationSQL = readFileSync(join(__dirname, '../APPLY_MIGRATION.sql'), 'utf8');
const lines = migrationSQL.split('\n').filter(l => !l.trim().startsWith('--') && l.trim());

console.log(`📊 Migration includes ${lines.filter(l => l.includes('ALTER TABLE')).length} table alterations`);
console.log(`📊 Migration includes ${lines.filter(l => l.includes('CREATE TABLE')).length} new tables`);
console.log(`📊 Migration includes ${lines.filter(l => l.includes('CREATE FUNCTION')).length} new functions`);
console.log('');

process.exit(0);
