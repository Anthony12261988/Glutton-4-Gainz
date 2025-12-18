const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://pdaueqnbbpvsndehgqbm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkYXVlcW5iYnB2c25kZWhncWJtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzOTQ1MCwiZXhwIjoyMDgwNDE1NDUwfQ.OP31psPqsWUXjYEXu0T8QDhJxKi3MU-tdCFjKIRI0x0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyFix() {
  const sql = fs.readFileSync(
    path.join(__dirname, '../supabase/migrations/051_fix_message_trigger.sql'),
    'utf8'
  );

  console.log('Applying message trigger fix...');

  const { data, error } = await supabase.rpc('exec_sql', { sql });

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  console.log('✅ Migration applied successfully!');
}

applyFix();
