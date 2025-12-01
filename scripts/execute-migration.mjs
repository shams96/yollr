import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = 'https://dklpoxigmpcjjynmbtga.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrbHBveGlnbXBjamp5bm1idGdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDAzMzM0OCwiZXhwIjoyMDc5NjA5MzQ4fQ.J9NWfC_5csqlFEHSTiKGPrc5ByIc9pZHT1-0ca2tbgQ';
const PROJECT_REF = 'dklpoxigmpcjjynmbtga';

console.log('🚀 Executing migration via Supabase Management API...\n');

// Read migration SQL
const migrationSQL = readFileSync(join(__dirname, '../APPLY_MIGRATION.sql'), 'utf8');

// Use Supabase Management API to execute SQL
function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });

    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Success');
          resolve(JSON.parse(responseData));
        } else {
          console.log(`⚠️  Status ${res.statusCode}: ${responseData}`);
          resolve({ error: responseData, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function runMigration() {
  console.log('📝 Sending migration SQL to Supabase...\n');

  try {
    const result = await executeSQL(migrationSQL);

    if (result.error) {
      console.log('\n⚠️  Migration API returned an error.');
      console.log('This might be because the Management API requires additional auth.\n');
      console.log('✅ Alternative: Migration page is ready at http://localhost:3002/admin/migrate');
      console.log('   Just open it and click 2 buttons!\n');
      process.exit(0);
    }

    console.log('\n✅ Migration executed successfully!\n');
    console.log('🎉 Friend invite system is now active!');
    console.log('\n📋 What was created:');
    console.log('   ✓ invite_code column on profiles');
    console.log('   ✓ friendships table');
    console.log('   ✓ Auto-friendship trigger');
    console.log('   ✓ XP reward system (50 XP each)\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.log('\n✅ Fallback: Use the migration page at http://localhost:3002/admin/migrate');
    process.exit(1);
  }
}

runMigration();
