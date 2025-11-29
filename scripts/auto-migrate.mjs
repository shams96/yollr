// This script opens the Supabase SQL Editor with the migration pre-filled
// You just need to click "Run"

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRef = 'dklpoxigmpcjjynmbtga';
const migrationSQL = readFileSync(join(__dirname, '../APPLY_MIGRATION.sql'), 'utf8');

// Encode SQL for URL
const encodedSQL = encodeURIComponent(migrationSQL);

// Construct URL with pre-filled SQL
const sqlEditorURL = `https://supabase.com/dashboard/project/${projectRef}/sql/new?content=${encodedSQL}`;

console.log('🚀 Opening Supabase SQL Editor with migration pre-filled...\n');
console.log('📋 You just need to:');
console.log('   1. Log in to Supabase (if not already)');
console.log('   2. Click the green "Run" button');
console.log('   3. Wait ~5 seconds for completion\n');

// Open browser
if (process.platform === 'win32') {
  exec(`start "" "${sqlEditorURL}"`);
} else if (process.platform === 'darwin') {
  exec(`open "${sqlEditorURL}"`);
} else {
  exec(`xdg-open "${sqlEditorURL}"`);
}

console.log('✅ Browser opened!');
console.log('');
console.log('⏱️  Note: If the SQL is too long for the URL, the browser will open');
console.log('        the SQL editor and you can paste from: APPLY_MIGRATION.sql');
