import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

// Load variables from .env.production.local
dotenv.config({ path: '.env.production.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function checkLiveHealth() {
  console.log('--- 1. Live API Health Check ---');
  try {
    const res = await fetch('https://compta-flow.net/api/health');
    console.log(`GET /api/health: Status ${res.status}`);
    const data = await res.json();
    console.log('Health details:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error fetching live health:', (e as any).message);
  }
}

async function checkLiveNetwork() {
  console.log('\n--- 2. Live Canada Network Status ---');
  try {
    const res = await fetch('https://compta-flow.net/api/network/status');
    console.log(`GET /api/network/status: Status ${res.status}`);
    const data = await res.json();
    console.log(`Active regions: ${data.regions ? data.regions.length : 0}`);
    console.log(`Network status: ${data.status}`);
  } catch (e) {
    console.error('Error fetching network status:', (e as any).message);
  }
}

async function checkDatabaseProfiles() {
  console.log('\n--- 3. Database Auth & Admin Profiles Check ---');
  if (!supabaseUrl || !supabaseKey) {
    console.log('Supabase credentials not available locally to check DB.');
    return;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    
    console.log('Authenticating as Samuel L. (Super Admin)...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 's.lahaie07@gmail.com',
      password: 'admin1234'
    });

    if (authError) {
      console.error('Authentication failed:', authError.message);
      return;
    }

    console.log(`Successfully authenticated! User ID: ${authData.user.id}`);
    console.log('Querying database profiles table...');
    
    // Now that we are signed in, RLS should allow us (super_admin) to see all profiles
    const { data: profiles, error: queryError } = await supabase
      .from('profiles')
      .select('email, role, full_name, status, created_at')
      .in('role', ['super_admin', 'sub_admin']);

    if (queryError) {
      console.error('Query profiles failed:', queryError.message);
    } else {
      console.log(`Found ${profiles.length} admin profiles in database:`);
      profiles.forEach(p => {
        console.log(`- ${p.email} (${p.role}): Name="${p.full_name}", Status="${p.status}"`);
      });
    }
  } catch (e) {
    console.error('Supabase error:', (e as any).message);
  }
}

function runLocalChecklists() {
  console.log('\n--- 4. Local Promotion Checks ---');
  try {
    const output = execSync('npm run promotion:check', { encoding: 'utf8' });
    console.log(output);
  } catch (e) {
    console.error('Promotion checklist run failed:', (e as any).message);
  }
}

async function runBiopsy() {
  console.log('🚀 Starting ComptaFlow Production Biopsy...');
  await checkLiveHealth();
  await checkLiveNetwork();
  await checkDatabaseProfiles();
  runLocalChecklists();
  console.log('🏁 Biopsy completed.');
}

runBiopsy();
