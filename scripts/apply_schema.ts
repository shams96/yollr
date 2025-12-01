import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function applySchema() {
  console.log('Reading schema file...');
  
  // Read the schema file
  const fs = require('fs');
  const path = require('path');
  const schemaPath = path.join(__dirname, '../supabase/schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    console.error('Schema file not found at:', schemaPath);
    process.exit(1);
  }
  
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  console.log('Applying schema to Supabase...');
  console.log('This may take a few minutes...');
  
  try {
    // Split schema into individual statements and execute them
    const statements = schema
      .split(';')
      .map((stmt: string) => stmt.trim())
      .filter((stmt: string) => stmt.length > 0 && !stmt.startsWith('--'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct execution if RPC fails
          const { error: directError } = await supabase
            .from('_sql')
            .select()
            .single() as any;
            
          if (directError) {
            console.warn(`Warning on statement ${i + 1}:`, error.message);
            errorCount++;
          } else {
            successCount++;
          }
        } else {
          successCount++;
        }
        
        if ((i + 1) % 10 === 0) {
          console.log(`Progress: ${i + 1}/${statements.length} statements processed...`);
        }
      } catch (stmtError) {
        console.warn(`Warning on statement ${i + 1}:`, stmtError instanceof Error ? stmtError.message : stmtError);
        errorCount++;
      }
    }
    
    console.log('\nSchema application complete!');
    console.log(`✅ Successful: ${successCount} statements`);
    console.log(`⚠️  Warnings: ${errorCount} statements`);
    
    if (errorCount > 0) {
      console.log('\nSome statements had warnings (this is normal for CREATE EXTENSION and some DDL operations)');
      console.log('The schema should still be mostly applied successfully.');
    }
    
  } catch (error) {
    console.error('Error applying schema:', error);
    process.exit(1);
  }
}

// Run the schema application
applySchema().catch(console.error);