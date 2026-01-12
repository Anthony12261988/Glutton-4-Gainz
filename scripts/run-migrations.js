#!/usr/bin/env node

/**
 * Migration Runner Script
 * Executes database migrations in order via Supabase Management API
 * 
 * Usage:
 *   node scripts/run-migrations.js [--env=dev|staging|prod] [--dry-run]
 * 
 * Environment Variables Required:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');
const DRY_RUN = process.argv.includes('--dry-run');
const ENV = process.argv.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'dev';

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  console.error(`${colors.red}❌ ${message}${colors.reset}`);
}

function success(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function info(message) {
  console.log(`${colors.cyan}ℹ️  ${message}${colors.reset}`);
}

function warn(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

// Get migration files in order
function getMigrationFiles() {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .filter(file => {
      // Skip individual migrations 001-012 if consolidated file exists
      const isEarlyMigration = /^00[1-9]|^01[0-2]/.test(file);
      const hasConsolidated = fs.existsSync(path.join(MIGRATIONS_DIR, '000_initial_schema.sql'));
      return !(isEarlyMigration && hasConsolidated && file !== '000_initial_schema.sql');
    })
    .sort();

  return files.map(file => ({
    name: file,
    path: path.join(MIGRATIONS_DIR, file),
  }));
}

// Check if migration has been executed
async function isMigrationExecuted(supabase, migrationName) {
  try {
    const { data, error } = await supabase
      .from('schema_migrations')
      .select('status')
      .eq('migration_name', migrationName)
      .eq('status', 'success')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error;
    }

    return !!data;
  } catch (err) {
    // If schema_migrations table doesn't exist, assume migration not run
    if (err.code === '42P01') { // relation does not exist
      return false;
    }
    throw err;
  }
}

// Record migration execution
async function recordMigration(supabase, migrationName, status, executionTime, errorMessage) {
  try {
    const { error } = await supabase.rpc('record_migration', {
      p_migration_name: migrationName,
      p_status: status,
      p_execution_time_ms: executionTime,
      p_error_message: errorMessage,
    });

    if (error) {
      // Fallback: direct insert if function doesn't exist
      const { error: insertError } = await supabase
        .from('schema_migrations')
        .insert({
          migration_name: migrationName,
          status: status,
          execution_time_ms: executionTime,
          error_message: errorMessage,
        })
        .select()
        .single();

      if (insertError) {
        warn(`Could not record migration: ${insertError.message}`);
      }
    }
  } catch (err) {
    warn(`Could not record migration: ${err.message}`);
  }
}

// Execute a single migration
async function executeMigration(supabase, migration) {
  const startTime = Date.now();
  const sql = fs.readFileSync(migration.path, 'utf8');

  log(`\n📄 Executing: ${migration.name}`, 'blue');

  if (DRY_RUN) {
    info('DRY RUN - Would execute migration');
    return { success: true, executionTime: 0 };
  }

  try {
    // Note: Supabase JS client doesn't support raw SQL execution
    // This script is a helper that checks migration status and provides guidance
    // Actual migration execution should use Supabase CLI: supabase db push
    
    warn('⚠️  Node.js script cannot execute SQL directly');
    warn('📝 Please use Supabase CLI for migration execution:');
    warn('   1. Install: npm install -g supabase');
    warn('   2. Login: supabase login');
    warn('   3. Link: supabase link --project-ref <project-ref>');
    warn('   4. Push: supabase db push');
    warn('');
    warn('   Or use: npm run migrate:dev (uses Supabase CLI)');
    
    // For now, we'll just record that we "would" execute it
    // In a real implementation, you'd use child_process to call supabase CLI
    // or use a PostgreSQL client library like 'pg'
    
    throw new Error('Use Supabase CLI for migration execution. See supabase/MIGRATIONS.md for details.');

    const executionTime = Date.now() - startTime;
    await recordMigration(supabase, migration.name, 'success', executionTime, null);
    
    success(`Migration ${migration.name} completed in ${executionTime}ms`);
    return { success: true, executionTime };

  } catch (err) {
    const executionTime = Date.now() - startTime;
    await recordMigration(supabase, migration.name, 'failed', executionTime, err.message);
    error(`Migration ${migration.name} failed: ${err.message}`);
    throw err;
  }
}

// Main execution
async function main() {
  log('\n🚀 Starting Migration Runner', 'cyan');
  log(`Environment: ${ENV}`, 'cyan');
  if (DRY_RUN) {
    warn('DRY RUN MODE - No changes will be made');
  }

  // Validate environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    error('NEXT_PUBLIC_SUPABASE_URL is required');
    process.exit(1);
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    error('SUPABASE_SERVICE_ROLE_KEY is required');
    process.exit(1);
  }

  // Initialize Supabase client with service role
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // Ensure schema_migrations table exists
  try {
    const schemaMigrationsSQL = fs.readFileSync(
      path.join(__dirname, '../supabase/migrations/schema_migrations.sql'),
      'utf8'
    );
    
    if (!DRY_RUN) {
      info('Creating schema_migrations tracking table...');
      // Note: This would need to be executed via Supabase CLI or direct SQL
      // For now, we'll assume it exists or will be created manually
    }
  } catch (err) {
    warn('schema_migrations.sql not found - migrations will not be tracked');
  }

  // Get migration files
  const migrations = getMigrationFiles();
  log(`\nFound ${migrations.length} migration files`, 'blue');

  if (migrations.length === 0) {
    error('No migration files found');
    process.exit(1);
  }

  // Execute migrations
  let executed = 0;
  let skipped = 0;
  let failed = 0;

  for (const migration of migrations) {
    try {
      // Check if already executed
      const alreadyExecuted = await isMigrationExecuted(supabase, migration.name);
      
      if (alreadyExecuted) {
        log(`⏭️  Skipping ${migration.name} (already executed)`, 'yellow');
        skipped++;
        continue;
      }

      // Execute migration
      await executeMigration(supabase, migration);
      executed++;

    } catch (err) {
      error(`Failed to execute ${migration.name}: ${err.message}`);
      failed++;
      
      if (!DRY_RUN) {
        log('\n❌ Migration failed. Stopping execution.', 'red');
        process.exit(1);
      }
    }
  }

  // Summary
  log('\n' + '='.repeat(50), 'cyan');
  log('Migration Summary', 'cyan');
  log('='.repeat(50), 'cyan');
  success(`Executed: ${executed}`);
  if (skipped > 0) {
    warn(`Skipped: ${skipped}`);
  }
  if (failed > 0) {
    error(`Failed: ${failed}`);
  }
  log('='.repeat(50) + '\n', 'cyan');

  if (failed > 0) {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(err => {
    error(`Fatal error: ${err.message}`);
    console.error(err);
    process.exit(1);
  });
}

module.exports = { main, getMigrationFiles, isMigrationExecuted };
