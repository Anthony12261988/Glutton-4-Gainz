#!/usr/bin/env node

/**
 * Check Migration Status
 * Shows which migrations have been executed
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');

// Colors
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

function getMigrationFiles() {
  return fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .filter(file => file !== 'schema_migrations.sql')
    .sort();
}

async function checkStatus() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    log('❌ Missing environment variables', 'red');
    log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

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

  const migrations = getMigrationFiles();
  
  log('\n📊 Migration Status Report', 'cyan');
  log('='.repeat(60), 'cyan');

  let executed = 0;
  let pending = 0;

  for (const migration of migrations) {
    try {
      const { data, error } = await supabase
        .from('schema_migrations')
        .select('status, executed_at, execution_time_ms')
        .eq('migration_name', migration)
        .eq('status', 'success')
        .single();

      if (data) {
        const time = data.execution_time_ms ? ` (${data.execution_time_ms}ms)` : '';
        log(`✅ ${migration.padEnd(40)} ${data.executed_at}${time}`, 'green');
        executed++;
      } else {
        log(`⏳ ${migration.padEnd(40)} PENDING`, 'yellow');
        pending++;
      }
    } catch (err) {
      // Table doesn't exist or migration not recorded
      if (err.code === 'PGRST116' || err.code === '42P01') {
        log(`⏳ ${migration.padEnd(40)} PENDING (not tracked)`, 'yellow');
        pending++;
      } else {
        log(`❓ ${migration.padEnd(40)} UNKNOWN (${err.message})`, 'red');
      }
    }
  }

  log('='.repeat(60), 'cyan');
  log(`Total: ${migrations.length} | Executed: ${executed} | Pending: ${pending}`, 'cyan');
  log('', 'reset');
}

checkStatus().catch(err => {
  log(`❌ Error: ${err.message}`, 'red');
  process.exit(1);
});
