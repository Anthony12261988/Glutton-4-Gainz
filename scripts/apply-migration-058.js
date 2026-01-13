#!/usr/bin/env node

/**
 * Direct Migration Applier for Migration 058
 * Applies the notifications table migration directly to the database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🔧 Applying Migration 058: Notifications Table\n');

  // Read the migration file
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '058_create_notifications.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  console.log('📄 Migration file loaded:', migrationPath);
  console.log('📊 SQL length:', migrationSQL.length, 'characters\n');

  try {
    // Execute the migration SQL
    console.log('⏳ Executing migration...');

    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // If exec_sql doesn't exist, we need to execute it differently
      if (error.message.includes('exec_sql')) {
        console.log('⚠️  Direct SQL execution not available via RPC');
        console.log('\n📋 Please apply this migration manually via Supabase Dashboard:');
        console.log('   1. Go to: https://supabase.com/dashboard/project/[your-project]/editor');
        console.log('   2. Open SQL Editor');
        console.log('   3. Copy and paste the following SQL:\n');
        console.log('─'.repeat(80));
        console.log(migrationSQL);
        console.log('─'.repeat(80));
        console.log('\n   4. Click "Run" to execute');
        console.log('\n💡 After applying, run: npm run regenerate-types');
        return;
      }
      throw error;
    }

    console.log('✅ Migration 058 applied successfully!\n');

    // Record the migration in schema_migrations table
    const { error: trackError } = await supabase
      .from('schema_migrations')
      .upsert({
        version: '058',
        name: 'create_notifications',
        executed_at: new Date().toISOString(),
        status: 'success'
      });

    if (trackError) {
      console.log('⚠️  Could not track migration in schema_migrations:', trackError.message);
    } else {
      console.log('✅ Migration tracked in schema_migrations table\n');
    }

    console.log('🎯 Next steps:');
    console.log('   1. Run: npx supabase gen types typescript --project-id [PROJECT_ID] > lib/types/database.types.ts');
    console.log('   2. Run: npm run build');
    console.log('   3. Verify build passes\n');

  } catch (err) {
    console.error('❌ Error applying migration:', err.message);
    console.error('\n📋 Manual Migration Required:');
    console.error('   Please copy the migration SQL from:');
    console.error('   ', migrationPath);
    console.error('   And execute it in Supabase Dashboard SQL Editor\n');
    process.exit(1);
  }
}

// Check if notifications table already exists
async function checkTableExists() {
  console.log('🔍 Checking if notifications table already exists...\n');

  const { data, error } = await supabase
    .from('notifications')
    .select('id')
    .limit(1);

  if (!error) {
    console.log('✅ Notifications table already exists!');
    console.log('   No migration needed.\n');
    console.log('🎯 Next step: Regenerate TypeScript types');
    console.log('   Run: npx supabase gen types typescript --project-id [PROJECT_ID] > lib/types/database.types.ts\n');
    return true;
  }

  if (error.message.includes('does not exist') || error.code === '42P01') {
    console.log('⏳ Notifications table does not exist. Applying migration...\n');
    return false;
  }

  // Some other error
  console.error('⚠️  Error checking table:', error.message);
  return false;
}

async function main() {
  console.log('═'.repeat(80));
  console.log('  Migration 058: Notifications Table');
  console.log('═'.repeat(80));
  console.log();

  const exists = await checkTableExists();

  if (!exists) {
    await applyMigration();
  }

  console.log('═'.repeat(80));
}

main().catch(console.error);
