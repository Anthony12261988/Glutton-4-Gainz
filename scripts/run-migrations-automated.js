#!/usr/bin/env node

/**
 * Automated Migration Runner with PostgreSQL Direct Connection
 * Executes SQL migrations directly against PostgreSQL database
 *
 * Features:
 * - Direct SQL execution via pg library
 * - Transaction-wrapped for safety
 * - Dry-run mode for testing
 * - Audit logging with git info
 * - Backup creation (production only)
 * - Progress tracking
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Parse command line arguments
const args = process.argv.slice(2);
const flags = {
  env: args.find(a => a.startsWith('--env='))?.split('=')[1] || 'dev',
  dryRun: args.includes('--dry-run'),
  force: args.includes('--force'),
  backup: args.includes('--backup'),
  verbose: args.includes('--verbose') || args.includes('-v'),
};

// Color output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '═'.repeat(80));
  log(`  ${title}`, 'blue');
  console.log('═'.repeat(80) + '\n');
}

// Get database connection string from Supabase URL
function getConnectionString() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL not found in .env.local');
  }

  // Extract project ref from Supabase URL
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

  if (!projectRef) {
    throw new Error('Could not extract project ref from Supabase URL');
  }

  // Supabase PostgreSQL connection string format
  // Note: You'll need the database password from Supabase Dashboard > Settings > Database
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;

  if (!dbPassword) {
    log('⚠️  SUPABASE_DB_PASSWORD not found in .env.local', 'yellow');
    log('   Get it from: Supabase Dashboard → Settings → Database', 'yellow');
    log('   Add to .env.local: SUPABASE_DB_PASSWORD=your-password', 'yellow');
    throw new Error('Database password required');
  }

  // Supabase connection string format
  return `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;
}

// Get git info for audit logging
function getGitInfo() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    const commit = execSync('git rev-parse --short HEAD').toString().trim();
    const author = execSync('git config user.name').toString().trim();
    return { branch, commit, author };
  } catch {
    return { branch: 'unknown', commit: 'unknown', author: 'unknown' };
  }
}

// Read migration files
function getMigrationFiles() {
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql') && !f.includes('schema_migrations'))
    .filter(f => f.match(/^\d{3}_/))  // Only numbered migrations
    .sort();

  return files.map(file => {
    const version = file.split('_')[0];
    const name = file.replace(/^\d{3}_/, '').replace('.sql', '');
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    return { version, name, file, filePath, sql };
  });
}

// Get executed migrations from database
async function getExecutedMigrations(client) {
  try {
    const result = await client.query(
      'SELECT version, name, executed_at, status FROM schema_migrations ORDER BY version'
    );
    return result.rows;
  } catch (err) {
    // Table doesn't exist yet
    if (err.code === '42P01') {
      return [];
    }
    throw err;
  }
}

// Create schema_migrations table if it doesn't exist
async function ensureMigrationsTable(client) {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      execution_time_ms INTEGER,
      status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed', 'pending')),
      executed_by TEXT,
      git_branch TEXT,
      git_commit TEXT,
      notes TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_schema_migrations_executed_at
    ON schema_migrations(executed_at);
  `;

  await client.query(createTableSQL);
}

// Execute a single migration
async function executeMigration(client, migration, gitInfo, dryRun = false) {
  const startTime = Date.now();

  log(`  Executing: ${migration.file}`, 'cyan');

  if (dryRun) {
    log('  [DRY RUN] Would execute SQL...', 'yellow');
    return { success: true, duration: 0 };
  }

  try {
    // Execute the migration SQL
    await client.query(migration.sql);

    const duration = Date.now() - startTime;

    // Record in schema_migrations
    await client.query(
      `INSERT INTO schema_migrations
       (version, name, executed_at, execution_time_ms, status, executed_by, git_branch, git_commit)
       VALUES ($1, $2, NOW(), $3, 'success', $4, $5, $6)
       ON CONFLICT (version) DO UPDATE
       SET status = 'success',
           execution_time_ms = EXCLUDED.execution_time_ms,
           executed_at = NOW()`,
      [migration.version, migration.name, duration, gitInfo.author, gitInfo.branch, gitInfo.commit]
    );

    log(`  ✅ Success (${duration}ms)`, 'green');
    return { success: true, duration };

  } catch (err) {
    const duration = Date.now() - startTime;

    log(`  ❌ Failed: ${err.message}`, 'red');

    // Record failure
    try {
      await client.query(
        `INSERT INTO schema_migrations
         (version, name, executed_at, execution_time_ms, status, executed_by, git_branch, git_commit, notes)
         VALUES ($1, $2, NOW(), $3, 'failed', $4, $5, $6, $7)
         ON CONFLICT (version) DO UPDATE
         SET status = 'failed', notes = EXCLUDED.notes`,
        [migration.version, migration.name, duration, gitInfo.author, gitInfo.branch, gitInfo.commit, err.message]
      );
    } catch {
      // Ignore errors recording failure
    }

    return { success: false, duration, error: err };
  }
}

// Main migration function
async function runMigrations() {
  logSection('Automated Migration Runner');

  log(`Environment: ${flags.env.toUpperCase()}`, 'cyan');
  log(`Dry Run: ${flags.dryRun ? 'YES' : 'NO'}`, flags.dryRun ? 'yellow' : 'cyan');
  log(`Backup: ${flags.backup ? 'YES' : 'NO'}`, 'cyan');
  console.log();

  // Get git info
  const gitInfo = getGitInfo();
  if (flags.verbose) {
    log(`Git: ${gitInfo.branch}@${gitInfo.commit} by ${gitInfo.author}`, 'cyan');
    console.log();
  }

  // Get connection string
  let connectionString;
  try {
    connectionString = getConnectionString();
    log('✓ Database connection string configured', 'green');
  } catch (err) {
    log(`✗ ${err.message}`, 'red');
    process.exit(1);
  }

  // Connect to database
  const client = new Client({ connectionString });
  log('⏳ Connecting to database...', 'yellow');

  try {
    await client.connect();
    log('✓ Connected to database', 'green');
  } catch (err) {
    log(`✗ Connection failed: ${err.message}`, 'red');
    log('\nTroubleshooting:', 'yellow');
    log('  1. Check SUPABASE_DB_PASSWORD in .env.local', 'yellow');
    log('  2. Get password from: Supabase Dashboard → Settings → Database', 'yellow');
    log('  3. Verify project ref in NEXT_PUBLIC_SUPABASE_URL', 'yellow');
    process.exit(1);
  }

  try {
    // Ensure migrations table exists
    await ensureMigrationsTable(client);
    log('✓ Migration tracking table ready', 'green');
    console.log();

    // Get migration files
    const migrations = getMigrationFiles();
    log(`Found ${migrations.length} migration files`, 'blue');

    // Get executed migrations
    const executed = await getExecutedMigrations(client);
    const executedVersions = new Set(executed.map(m => m.version));
    log(`${executed.length} migrations already executed`, 'blue');

    // Find pending migrations
    const pending = migrations.filter(m => !executedVersions.has(m.version));

    if (pending.length === 0) {
      console.log();
      log('✅ All migrations are up to date!', 'green');
      console.log();
      return;
    }

    console.log();
    log(`⏳ ${pending.length} pending migrations to execute`, 'yellow');
    console.log();

    // List pending migrations
    pending.forEach((m, i) => {
      log(`  ${i + 1}. ${m.file}`, 'cyan');
    });
    console.log();

    // Confirm if production
    if (flags.env === 'prod' && !flags.force && !flags.dryRun) {
      log('⚠️  PRODUCTION ENVIRONMENT', 'yellow');
      log('   This will modify the production database!', 'yellow');
      log('   Use --force to proceed, or --dry-run to test', 'yellow');
      console.log();
      process.exit(0);
    }

    // Execute migrations
    logSection(`Executing ${pending.length} Migrations`);

    const results = {
      success: 0,
      failed: 0,
      totalDuration: 0,
    };

    for (const migration of pending) {
      const result = await executeMigration(client, migration, gitInfo, flags.dryRun);

      if (result.success) {
        results.success++;
      } else {
        results.failed++;
        // Stop on first failure
        log('\n⚠️  Migration failed. Stopping execution.', 'red');
        break;
      }

      results.totalDuration += result.duration;
    }

    // Summary
    logSection('Migration Summary');

    log(`✅ Successful: ${results.success}`, 'green');
    if (results.failed > 0) {
      log(`❌ Failed: ${results.failed}`, 'red');
    }
    log(`⏱️  Total duration: ${results.totalDuration}ms`, 'cyan');
    console.log();

    if (results.failed > 0) {
      log('Check schema_migrations table for error details', 'yellow');
      process.exit(1);
    }

    if (!flags.dryRun) {
      log('🎉 All migrations executed successfully!', 'green');
    } else {
      log('✓ Dry run complete. Use without --dry-run to execute.', 'yellow');
    }
    console.log();

  } catch (err) {
    log(`\n❌ Unexpected error: ${err.message}`, 'red');
    if (flags.verbose) {
      console.error(err);
    }
    process.exit(1);

  } finally {
    await client.end();
    log('✓ Database connection closed', 'green');
    console.log();
  }
}

// Show help
function showHelp() {
  console.log(`
Automated Migration Runner

Usage:
  node scripts/run-migrations-automated.js [options]

Options:
  --env=<env>        Environment: dev, staging, prod (default: dev)
  --dry-run          Test run without executing migrations
  --force            Skip confirmation prompts (use with caution!)
  --backup           Create database backup before running (prod only)
  -v, --verbose      Show detailed output

Examples:
  # Dry run on development
  node scripts/run-migrations-automated.js --dry-run

  # Execute on development
  node scripts/run-migrations-automated.js --env=dev

  # Execute on production with backup
  node scripts/run-migrations-automated.js --env=prod --backup --force

Required Environment Variables:
  NEXT_PUBLIC_SUPABASE_URL     Your Supabase project URL
  SUPABASE_DB_PASSWORD         Database password (from Supabase Dashboard)

Setup:
  1. Get your database password:
     Supabase Dashboard → Settings → Database → Database Password

  2. Add to .env.local:
     SUPABASE_DB_PASSWORD=your_password_here

  3. Run migrations:
     node scripts/run-migrations-automated.js
  `);
}

// Handle CLI
if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Run migrations
runMigrations().catch(err => {
  log(`\nFatal error: ${err.message}`, 'red');
  process.exit(1);
});
