import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const email = process.env.ADMIN_EMAIL || '';
const password = process.env.ADMIN_PASSWORD || '';

if (!supabaseUrl || !serviceRoleKey || !email || !password) {
  console.error('❌ Requis: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD dans .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function setupAdmin() {
  console.log(`🚀 Configuration admin pour : ${email}`);

  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: 'Super Admin' },
  });

  let userId = '';

  if (authError) {
    if (authError.message.includes('already registered')) {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = users?.users?.find((u: { email?: string; id: string }) => u.email === email);
      userId = existingUser?.id || '';
    } else {
      console.error('❌ Erreur Auth:', authError.message);
      return;
    }
  } else {
    userId = authUser.user.id;
    console.log('✅ Utilisateur créé.');
  }

  if (userId) {
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: userId,
      email,
      display_name: 'Super Admin',
      role: 'super_admin',
      status: 'active',
    });

    if (profileError) {
      console.error('❌ Erreur Profile:', profileError.message);
    } else {
      console.log(`🏆 Compte ${email} configuré en super_admin.`);
    }
  }
}

setupAdmin();
