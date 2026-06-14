import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function runGuerillaMarketingTest() {
  console.log("🚀 INITIALISATION DE L'OPÉRATION GUERILLA LAUNCH (STRESS-TEST)...");
  
  const leadSources = ['GOOGLE', 'META', 'DIRECT', 'LINKEDIN', 'TWITTER'];
  const campaigns = ['PROMO_JUILLET_2026', 'ELITE_ONBOARDING', 'IA_FISCALE_LAUNCH'];
  
  let totalLeads = 0;
  const batchSize = 50;
  const totalTarget = 250;

  for (let i = 0; i < totalTarget; i += batchSize) {
    const leadsBatch = Array.from({ length: batchSize }).map(() => ({
      source: leadSources[Math.floor(Math.random() * leadSources.length)],
      campaign_id: campaigns[Math.floor(Math.random() * campaigns.length)],
      revenue_estimate: Math.floor(Math.random() * (5000 - 500) + 500),
      metadata: { 
        is_simulated: true, 
        browser: 'Guerilla Bot v1.0',
        region: Math.random() > 0.5 ? 'Québec' : 'Montréal'
      },
      converted_at: Math.random() > 0.7 ? new Date().toISOString() : null
    }));

    const { error } = await supabaseAdmin.from('marketing_leads').insert(leadsBatch);
    
    if (error) {
      console.error(`❌ Erreur lors de l'injection du batch ${i}:`, error.message);
    } else {
      totalLeads += batchSize;
      console.log(`✅ Batch injecté : ${totalLeads}/${totalTarget} prospects générés.`);
    }
    
    // Attendre un peu entre les batchs pour simuler un flux
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n🏆 OPÉRATION TERMINÉE : ${totalLeads} prospects ont "frappé" à la porte de ComptaFlow.`);
  console.log("📊 Vérifiez votre Dashboard Admin pour analyser les données de conversion.");
}

runGuerillaMarketingTest();
