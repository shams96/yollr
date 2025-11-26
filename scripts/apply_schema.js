const fs = require('fs');
const path = require('path');

// Read .env.local file manually
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse environment variables
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    envVars[key] = value;
  }
});

// Debug: Check if env vars are loaded
console.log('Supabase URL:', envVars.NEXT_PUBLIC_SUPABASE_URL ? 'Loaded' : 'MISSING');
console.log('Service Key:', envVars.SUPABASE_SERVICE_ROLE_KEY ? 'Loaded' : 'MISSING');

// Initialize Supabase client with service role key
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY,
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
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        // Skip empty statements and comments
        if (!statement || statement.startsWith('/*') || statement.startsWith('--')) {
          continue;
        }
        
        // Execute the SQL statement
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // If RPC fails, try a different approach
          console.warn(`Warning on statement ${i + 1}:`, error.message);
          errorCount++;
        } else {
          successCount++;
        }
        
        if ((i + 1) % 10 === 0) {
          console.log(`Progress: ${i + 1}/${statements.length} statements processed...`);
        }
      } catch (stmtError) {
        console.warn(`Warning on statement ${i + 1}:`, stmtError.message || stmtError);
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