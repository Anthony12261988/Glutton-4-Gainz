#!/usr/bin/env node

/**
 * Database Backup Script
 * Creates timestamped database backups using pg_dump
 *
 * Features:
 * - Timestamped backup files
 * - Automatic cleanup of old backups
 * - Environment-specific backups
 * - Backup verification
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

require('dotenv').config({ path: '.env.local' });

// Parse arguments
const args = process.argv.slice(2);
const flags = {
  env: args.find(a => a.startsWith('--env='))?.split('=')[1] || 'dev',
  keep: parseInt(args.find(a => a.startsWith('--keep='))?.split('=')[1] || '7', 10),
  verbose: args.includes('--verbose') || args.includes('-v'),
};

// Colors
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

// Get database connection info
function getConnectionInfo() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;

  if (!supabaseUrl || !dbPassword) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_DB_PASSWORD in .env.local');
  }

  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) {
    throw new Error('Could not extract project ref from Supabase URL');
  }

  return {
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    database: 'postgres',
    username: 'postgres',
    password: dbPassword,
    projectRef,
  };
}

// Create backup directory
function ensureBackupDir() {
  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  return backupDir;
}

// Generate backup filename
function getBackupFilename(env, projectRef) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
  return `backup_${env}_${projectRef}_${timestamp}.sql`;
}

// Create database backup
async function createBackup(connInfo, backupPath) {
  log('⏳ Creating database backup...', 'yellow');

  const command = `PGPASSWORD="${connInfo.password}" pg_dump \
    -h ${connInfo.host} \
    -p ${connInfo.port} \
    -U ${connInfo.username} \
    -d ${connInfo.database} \
    --no-owner \
    --no-privileges \
    -F p \
    -f "${backupPath}"`;

  try {
    await execAsync(command, { maxBuffer: 50 * 1024 * 1024 }); // 50MB buffer
    return true;
  } catch (err) {
    throw new Error(`Backup failed: ${err.message}`);
  }
}

// Verify backup file
function verifyBackup(backupPath) {
  if (!fs.existsSync(backupPath)) {
    throw new Error('Backup file was not created');
  }

  const stats = fs.statSync(backupPath);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

  if (stats.size === 0) {
    throw new Error('Backup file is empty');
  }

  return { size: stats.size, sizeMB };
}

// Clean up old backups
function cleanupOldBackups(backupDir, keep) {
  const files = fs.readdirSync(backupDir)
    .filter(f => f.startsWith('backup_') && f.endsWith('.sql'))
    .map(f => ({
      name: f,
      path: path.join(backupDir, f),
      stats: fs.statSync(path.join(backupDir, f)),
    }))
    .sort((a, b) => b.stats.mtime - a.stats.mtime);

  if (files.length <= keep) {
    return 0;
  }

  const toDelete = files.slice(keep);
  let deleted = 0;

  toDelete.forEach(file => {
    try {
      fs.unlinkSync(file.path);
      deleted++;
      if (flags.verbose) {
        log(`  Deleted: ${file.name}`, 'cyan');
      }
    } catch (err) {
      log(`  Failed to delete ${file.name}: ${err.message}`, 'yellow');
    }
  });

  return deleted;
}

// Main backup function
async function runBackup() {
  logSection('Database Backup');

  log(`Environment: ${flags.env.toUpperCase()}`, 'cyan');
  log(`Keep last: ${flags.keep} backups`, 'cyan');
  console.log();

  // Check if pg_dump is available
  try {
    await execAsync('pg_dump --version');
    log('✓ pg_dump is available', 'green');
  } catch {
    log('✗ pg_dump not found', 'red');
    log('\nInstall PostgreSQL client tools:', 'yellow');
    log('  macOS: brew install postgresql', 'yellow');
    log('  Linux: sudo apt-get install postgresql-client', 'yellow');
    log('  Windows: https://www.postgresql.org/download/windows/', 'yellow');
    process.exit(1);
  }

  // Get connection info
  let connInfo;
  try {
    connInfo = getConnectionInfo();
    log('✓ Database connection info configured', 'green');
  } catch (err) {
    log(`✗ ${err.message}`, 'red');
    process.exit(1);
  }

  // Ensure backup directory exists
  const backupDir = ensureBackupDir();
  log(`✓ Backup directory: ${backupDir}`, 'green');
  console.log();

  // Generate backup filename
  const backupFilename = getBackupFilename(flags.env, connInfo.projectRef);
  const backupPath = path.join(backupDir, backupFilename);

  log(`Creating backup: ${backupFilename}`, 'blue');
  console.log();

  // Create backup
  try {
    await createBackup(connInfo, backupPath);
    log('✓ Backup created successfully', 'green');
  } catch (err) {
    log(`✗ ${err.message}`, 'red');
    process.exit(1);
  }

  // Verify backup
  try {
    const { sizeMB } = verifyBackup(backupPath);
    log(`✓ Backup verified (${sizeMB} MB)`, 'green');
  } catch (err) {
    log(`✗ ${err.message}`, 'red');
    process.exit(1);
  }

  console.log();
  log(`📁 Backup saved to:`, 'blue');
  log(`   ${backupPath}`, 'cyan');
  console.log();

  // Cleanup old backups
  log('🧹 Cleaning up old backups...', 'yellow');
  const deleted = cleanupOldBackups(backupDir, flags.keep);

  if (deleted > 0) {
    log(`✓ Deleted ${deleted} old backup(s)`, 'green');
  } else {
    log('✓ No old backups to delete', 'green');
  }

  console.log();
  logSection('Backup Complete');

  log('✅ Database backup successful!', 'green');
  console.log();

  log('To restore this backup:', 'blue');
  log(`  psql -h ${connInfo.host} -p ${connInfo.port} -U ${connInfo.username} -d ${connInfo.database} -f "${backupPath}"`, 'cyan');
  console.log();
}

// Show help
function showHelp() {
  console.log(`
Database Backup Script

Usage:
  node scripts/backup-database.js [options]

Options:
  --env=<env>        Environment: dev, staging, prod (default: dev)
  --keep=<n>         Number of backups to keep (default: 7)
  -v, --verbose      Show detailed output

Examples:
  # Create backup for development
  node scripts/backup-database.js --env=dev

  # Create backup and keep only last 3
  node scripts/backup-database.js --keep=3

  # Create production backup
  node scripts/backup-database.js --env=prod

Required:
  - PostgreSQL client tools (pg_dump) must be installed
  - SUPABASE_DB_PASSWORD in .env.local

Installation:
  macOS:    brew install postgresql
  Linux:    sudo apt-get install postgresql-client
  Windows:  https://www.postgresql.org/download/windows/
  `);
}

// Handle CLI
if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Run backup
runBackup().catch(err => {
  log(`\nFatal error: ${err.message}`, 'red');
  process.exit(1);
});
