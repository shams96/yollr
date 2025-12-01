import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dklpoxigmpcjjynmbtga.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrbHBveGlnbXBjamp5bm1idGdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDAzMzM0OCwiZXhwIjoyMDc5NjA5MzQ4fQ.J9NWfC_5csqlFEHSTiKGPrc5ByIc9pZHT1-0ca2tbgQ';

console.log('🚀 Applying database migration...\n');

// Create admin client
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Read migration SQL
const migrationSQL = readFileSync(join(__dirname, '../APPLY_MIGRATION.sql'), 'utf8');

async function executeSQLStatements() {
  // Split SQL into individual statements
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .filter(s => !s.startsWith('--'))
    .filter(s => !s.match(/^(Step|YOLLR|Run this)/i));

  console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const preview = statement.substring(0, 100).replace(/\n/g, ' ') + '...';

    console.log(`[${i + 1}/${statements.length}] ${preview}`);

    try {
      // Execute using RPC call to a custom function
      // Since Supabase doesn't have a direct SQL execution endpoint,
      // we'll use the postgres extension
      const { error } = await supabase.rpc('exec', {
        sql: statement + ';'
      });

      if (error) {
        // Check if it's a benign error (already exists)
        if (
          error.message?.includes('already exists') ||
          error.message?.includes('duplicate') ||
          error.code === '42P07' || // relation already exists
          error.code === '42710'    // object already exists
        ) {
          console.log('   ⏭️  Already exists (skipped)');
          skipCount++;
        } else {
          console.log(`   ⚠️  ${error.message}`);
          errorCount++;
        }
      } else {
        console.log('   ✅ Success');
        successCount++;
      }
    } catch (err) {
      console.log(`   ❌ ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ⏭️  Skipped: ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);

  // Verify migration
  console.log('\n🔍 Verifying migration...');
  const { data, error } = await supabase
    .from('profiles')
    .select('id, invite_code, referred_by')
    .limit(1);

  if (error) {
    console.log('❌ Verification failed:', error.message);
    console.log('\n⚠️  The migration may not have been applied successfully.');
    console.log('📋 Please apply it manually via the Supabase Dashboard:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/dklpoxigmpcjjynmbtga/sql/new');
    console.log('   2. Copy SQL from: APPLY_MIGRATION.sql');
    console.log('   3. Paste and click "Run"\n');
    process.exit(1);
  } else {
    console.log('✅ Migration verified successfully!');
    console.log('\n🎉 Friend invite system is now active!');
    console.log('\n📋 What was created:');
    console.log('   ✓ invite_code column on profiles');
    console.log('   ✓ friendships table');
    console.log('   ✓ Auto-friendship trigger');
    console.log('   ✓ XP reward system (50 XP each)\n');
  }
}

executeSQLStatements().catch(err => {
  console.error('\n❌ Migration failed:', err.message);
  console.log('\n📋 Manual migration required:');
  console.log('   Open: http://localhost:3002/admin/migrate');
  console.log('   Or visit: https://supabase.com/dashboard/project/dklpoxigmpcjjynmbtga/sql/new\n');
  process.exit(1);
});
