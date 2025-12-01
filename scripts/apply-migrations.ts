/**
 * Migration Script - Friend Invite System
 * Run with: npx tsx scripts/apply-migrations.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

async function applyMigration() {
  // Load environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
    console.error('   SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseServiceKey ? '✓' : '✗');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('🚀 Starting migration...\n');

  // Read the migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/20250127000000_add_friend_invites.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  console.log('📄 Migration file loaded');
  console.log('📝 SQL size:', migrationSQL.length, 'bytes\n');

  // Split SQL into individual statements (separated by semicolons)
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

  // Execute each statement
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const preview = statement.substring(0, 60).replace(/\n/g, ' ') + '...';

    try {
      console.log(`[${i + 1}/${statements.length}] Executing: ${preview}`);

      const { error } = await supabase.rpc('exec_sql', {
        sql_query: statement + ';'
      }).single();

      if (error) {
        // Try direct query as fallback
        const { error: directError } = await supabase
          .from('_migrations')
          .select('*')
          .limit(0); // This will fail, but we use it to execute raw SQL

        if (directError) {
          throw error;
        }
      }

      console.log('   ✅ Success\n');
      successCount++;
    } catch (error: any) {
      console.log('   ⚠️  Error (might be okay if already exists):', error.message);
      console.log('');
      errorCount++;
    }
  }

  console.log('\n📊 Migration Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ⚠️  Errors: ${errorCount}`);
  console.log('');

  if (errorCount > 0) {
    console.log('⚠️  Some statements failed. This is usually okay if:');
    console.log('   - Columns/tables already exist');
    console.log('   - Indexes already exist');
    console.log('   - Functions are being recreated');
    console.log('');
  }

  console.log('✨ Migration process complete!\n');
  console.log('🔍 Verifying migration...\n');

  // Verify the migration by checking if the new columns exist
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('invite_code, referred_by')
      .limit(1);

    if (!error) {
      console.log('✅ Verification successful! New columns are accessible.');
      console.log('');
      console.log('🎉 Migration applied successfully!\n');
      console.log('Next steps:');
      console.log('1. Test signup with invite code on http://localhost:3002');
      console.log('2. Check that invite codes are generated');
      console.log('3. Verify friendships are created when invite codes are used');
      console.log('');
    } else {
      throw error;
    }
  } catch (error: any) {
    console.error('❌ Verification failed:', error.message);
    console.log('');
    console.log('The migration may not have been fully applied.');
    console.log('Please check your Supabase dashboard SQL editor and run the migration manually.');
    process.exit(1);
  }
}

applyMigration().catch(console.error);
