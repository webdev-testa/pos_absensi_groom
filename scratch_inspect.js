import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read env variables from Absen_Dr.Meow/.env
const envPath = './.env';
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseServiceKey = env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'hr' }
});

async function run() {
  console.log('Inspecting RLS policies on hr.attendance...');
  
  // We can query pg_policies using an RPC or we can fetch it if there is a way.
  // Wait, does Supabase have a way to run SQL or query pg_policies via standard REST API?
  // By default, the schema 'hr' is exposed, but system tables are in 'pg_catalog' which is not exposed.
  // Let's try to query information_schema or pg_policies directly.
  // Actually, we can check if we can query the policies from postgrest by exposing pg_catalog.
  // Since pg_catalog is not exposed, we probably can't.
  // Let's print the list of tables we can see.
  
  // Wait! Let's try to fetch a record from hr.attendance
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', '37ef5d7a-f432-4daa-9528-771f25a0fe2a')
    .order('date', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching attendance:', error);
  } else {
    console.log('Attendance records for test user:', data);
  }
}

run();
