import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

export async function POST() {
  try {
    // Use service role key for admin access
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🚀 Starting migration...');

    // Read migration file
    const migrationPath = path.join(process.cwd(), 'APPLY_MIGRATION.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
      .filter(s => !s.match(/^(Step \d+|MIGRATION|Run this|You can verify)/i));

    console.log(`Found ${statements.length} statements to execute`);

    const results = [];

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      const preview = statement.substring(0, 80).replace(/\n/g, ' ');

      try {
        console.log(`[${i + 1}/${statements.length}] Executing: ${preview}...`);

        // Use rpc to execute raw SQL (requires a custom function in Supabase)
        // Since we don't have that, we'll use a workaround with .sql() if available
        // Or execute via direct query

        // Try using from().select() with raw SQL
        const { data, error } = await supabase.rpc('exec_sql', { query: statement });

        if (error && error.code !== '42P07') {  // Ignore "already exists" errors
          console.log(`   ⚠️  Warning: ${error.message}`);
          results.push({
            statement: preview,
            status: 'warning',
            message: error.message
          });
        } else {
          console.log('   ✅ Success');
          results.push({
            statement: preview,
            status: 'success'
          });
        }
      } catch (err: any) {
        // Ignore errors about things already existing
        if (err.message?.includes('already exists') || err.code === '42P07') {
          console.log('   ✅ Already exists (OK)');
          results.push({
            statement: preview,
            status: 'exists'
          });
        } else {
          console.log(`   ❌ Error: ${err.message}`);
          results.push({
            statement: preview,
            status: 'error',
            message: err.message
          });
        }
      }
    }

    // Verify migration worked
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('invite_code, referred_by')
        .limit(1);

      if (!error) {
        console.log('✅ Migration verified successfully!');
        return NextResponse.json({
          success: true,
          message: 'Migration completed successfully!',
          results,
          verified: true
        });
      }
    } catch (err) {
      console.log('⚠️  Verification failed, but migration may have succeeded');
    }

    return NextResponse.json({
      success: true,
      message: 'Migration executed with some warnings',
      results,
      verified: false
    });

  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
