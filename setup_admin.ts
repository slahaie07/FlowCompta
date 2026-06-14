import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function setupAdmin() {
  const email = 's.lahaie07@gmail.com';
  const password = 'Maison-139';

  console.log(`🚀 Tentative de configuration Admin pour : ${email}`);

  // 1. Création ou récupération de l'utilisateur dans Auth
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: 'Samuel L. (Architecte)' }
  });

  let userId = '';

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log('ℹ️ L\'utilisateur existe déjà dans Auth, récupération de l\'ID...');
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = users.users.find(u => u.email === email);
      userId = existingUser?.id || '';
    } else {
      console.error('❌ Erreur Auth:', authError.message);
      return;
    }
  } else {
    userId = authUser.user.id;
    console.log('✅ Utilisateur créé avec succès.');
  }

  if (userId) {
    // 2. Forcer le rôle Admin dans la table profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email: email,
        display_name: 'Samuel L. (Architecte)',
        role: 'admin',
        status: 'active'
      });

    if (profileError) {
      console.error('❌ Erreur Profile:', profileError.message);
    } else {
      console.log(`🏆 Succès ! Le compte ${email} est désormais ADMINISTRATEUR SUPRÊME.`);
    }
  }
}

setupAdmin();
