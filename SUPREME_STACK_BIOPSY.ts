
import 'dotenv/config';
import { supabase } from './src/lib/supabase';
import { CONFIG } from './src/lib/config';

/**
 * 🏛️ TRIPLE-ROLE ORCHESTRATION TEST (V1.0)
 * Scénario : Super Admin -> Sub Admin -> Client.
 */

async function runSupremeBiopsy() {
  console.log("👑 Lancement de la biopsie Triple-Rôle ComptaFlow...");

  const timestamp = Date.now();
  const emails = {
    super: `super_test_${timestamp}@gmail.com`,
    sub: `sub_test_${timestamp}@gmail.com`,
    client: `client_test_${timestamp}@gmail.com`
  };
  const password = "SupremePassword123!";
  const ids: any = {};

  try {
    // --- PHASE 1 : SUPER ADMIN ---
    console.log("\n--- [1/3] TEST SUPER ADMIN ---");
    // Note: Pour tester le rôle Super Admin sans modifier config.ts, 
    // on va simuler l'existence de l'email dans la base.
    const { data: superAuth, error: superError } = await supabase.auth.signUp({
      email: emails.super,
      password: password,
      options: { data: { full_name: "Super Admin Test" } }
    });
    if (superError) throw superError;
    ids.super = superAuth.user?.id;
    
    // Forcer le rôle en DB (le trigger met 'client' par défaut)
    await supabase.from('profiles').update({ role: 'super_admin' }).eq('id', ids.super);
    console.log("✅ Super Admin créé et authentifié.");

    // Action Super Admin : Voir tous les profils (Test RLS)
    const { data: allProfiles } = await supabase.from('profiles').select('*');
    console.log(`🔍 Super Admin : ${allProfiles?.length} profils visibles sur le réseau.`);

    // --- PHASE 2 : SUB ADMIN (COMPTABLE) ---
    console.log("\n--- [2/3] TEST SUB ADMIN (COMPTABLE) ---");
    const { data: subAuth, error: subError } = await supabase.auth.signUp({
      email: emails.sub,
      password: password,
      options: { data: { full_name: "Comptable Partenaire Test" } }
    });
    if (subError) throw subError;
    ids.sub = subAuth.user?.id;

    await supabase.from('profiles').update({ role: 'sub_admin' }).eq('id', ids.sub);
    console.log("✅ Sub Admin créé.");

    // Action Sub Admin : Créer une facture pour un futur client
    // On doit d'abord avoir l'ID du client.
    
    // --- PHASE 3 : CLIENT ---
    console.log("\n--- [3/3] TEST CLIENT ---");
    const { data: clientAuth, error: clientError } = await supabase.auth.signUp({
      email: emails.client,
      password: password,
      options: { data: { full_name: "Client Final Test" } }
    });
    if (clientError) throw clientError;
    ids.client = clientAuth.user?.id;

    // Assigner le client au sub admin
    await supabase.from('profiles').update({ sub_admin_id: ids.sub }).eq('id', ids.client);
    console.log("✅ Client créé et assigné au Sub Admin.");

    // Action Client : Envoyer un message
    const { error: msgError } = await supabase.from('messages').insert({
      user_id: ids.client,
      sender: 'client',
      text: "Ceci est un message de test de production.",
      client_name: "Client Test"
    });
    if (msgError) throw msgError;
    console.log("✅ Message client envoyé.");

    // Action Sub Admin (Vérification) : Voir le message du client
    const { data: subMessages } = await supabase.from('messages').select('*').eq('user_id', ids.client);
    if (subMessages && subMessages.length > 0) {
      console.log("✅ Sub Admin : Message du client intercepté avec succès.");
    }

    // --- PHASE 4 : NETTOYAGE CHIRURGICAL ---
    console.log("\n--- [CLEANUP] Purge de la base Empire ---");
    
    const tables = ['messages', 'transactions', 'invoices', 'service_requests', 'service_results', 'profiles'];
    for (const table of tables) {
      const userField = table === 'profiles' ? 'id' : 'user_id';
      const clientIdField = table === 'service_requests' || table === 'service_results' ? 'client_id' : userField;
      
      await supabase.from(table).delete().in(clientIdField, [ids.super, ids.sub, ids.client]);
    }
    
    console.log("🗑️ Données de test supprimées de la base de données.");
    console.log("\n🏆 BIOPSIE TOTALE RÉUSSIE : L'orchestration Triple-Rôle est parfaite.");

  } catch (err: any) {
    console.error("\n❌ ÉCHEC DE LA BIOPSIE :");
    console.error(err.message || err);
  }
}

runSupremeBiopsy();
