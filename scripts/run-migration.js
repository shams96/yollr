const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://dklpoxigmpcjjynmbtga.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrbHBveGlnbXBjamp5bm1idGdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDAzMzM0OCwiZXhwIjoyMDc5NjA5MzQ4fQ.J9NWfC_5csqlFEHSTiKGPrc5ByIc9pZHT1-0ca2tbgQ';

// Read the migration SQL file
const migrationPath = path.join(__dirname, '../APPLY_MIGRATION.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('🚀 Starting database migration...\n');

// Function to execute SQL via Supabase REST API
async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL('/rest/v1/rpc/exec_sql', SUPABASE_URL);

    const options = {
      hostname: url.hostname,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'return=minimal'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data });
        } else {
          resolve({ success: false, error: data, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', (error) => reject(error));
    req.write(JSON.stringify({ sql_query: sql }));
    req.end();
  });
}

// Alternative: Execute via direct SQL endpoint
async function executeSQLDirect(sql) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'dklpoxigmpcjjynmbtga.supabase.co',
      path: '/rest/v1/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'return=minimal'
      }
    };

    // We'll use the pg_stat_statements approach or direct column addition
    console.log('Attempting direct SQL execution...\n');

    // Since we can't execute arbitrary SQL via REST API easily,
    // we'll break down the migration into specific operations
    resolve({ success: true, message: 'Using table operations...' });
  });
}

async function applyMigration() {
  console.log('📋 Migration: Friend Invite System\n');
  console.log('This will add:');
  console.log('  ✓ invite_code column to profiles');
  console.log('  ✓ referred_by column to profiles');
  console.log('  ✓ friendships table');
  console.log('  ✓ Auto-friendship trigger');
  console.log('  ✓ XP rewards (50 XP each)\n');

  console.log('⚠️  Note: Supabase REST API does not support arbitrary SQL execution.');
  console.log('    The migration must be run through the Supabase SQL Editor.\n');

  console.log('📝 Migration SQL file is ready at:');
  console.log('    ' + migrationPath + '\n');

  console.log('🔗 Quick Steps:');
  console.log('1. Go to: https://supabase.com/dashboard/project/dklpoxigmpcjjynmbtga/sql');
  console.log('2. Click "New Query"');
  console.log('3. Copy content from: APPLY_MIGRATION.sql');
  console.log('4. Paste and click "Run"\n');

  console.log('⏱️  This will take ~10 seconds\n');
}

applyMigration().catch(console.error);
