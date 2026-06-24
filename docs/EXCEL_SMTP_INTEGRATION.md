# 🏛️ Cabinet Comptaflow — Intégration Excel & SMTP Email (V5.0)

Ce document fournit le code d'intégration technique complet pour relier le portail d'onboarding Compta-Flow avec le fichier Excel central (`Portail - Compta-flow.xlsx`) et le serveur SMTP de `compta-flow@outlook.com`.

---

## 📝 1. Payload Webhook (Acquisition Formulaire)

Ce format JSON est envoyé par le Front-End lors de la validation de la Phase 1 et capturé par le routeur Back-End ou n8n :

```json
{
  "userId": "d7b88f34-1c9a-4122-83bb-92f7678bb111",
  "displayName": "Marie Tremblay",
  "email": "marie.tremblay@design.ca",
  "phone": "+1 514-555-0199",
  "city": "Montréal",
  "province": "QC",
  "language": "fr",
  "initialProfileType": "business",
  "companyName": "Tremblay Design Inc.",
  "neq": "1172839401",
  "nas": "123-456-789",
  "selectedExpertName": "Eya",
  "selectedExpertEmail": "eya-cpa@outlook.com",
  "services": ["Tenue de livres & Taxes", "Aide impôt autonome"],
  "timestamp": "2026-06-24T05:04:12Z"
}
```

---

## 📊 2. Code d'Écriture Excel (Python / Pandas / openpyxl)

Ce script Python lit le fichier central "Portail - Compta-flow.xlsx" et injecte de manière sécurisée les nouvelles lignes dans les onglets concernés :

```python
import os
import datetime
import openpyxl
from openpyxl import load_workbook

EXCEL_FILE = "Portail - Compta-flow.xlsx"

def initialize_excel_file():
    """Initialise le fichier Excel avec ses 4 onglets s'il n'existe pas."""
    if os.path.exists(EXCEL_FILE):
        return
    
    wb = openpyxl.Workbook()
    # Onglet 1: Répertoire Clients
    ws1 = wb.active
    ws1.title = "Répertoire Clients"
    ws1.append(['ID Client', 'Nom / Raison sociale', 'Type de client', 'Courriel', 'Téléphone', 'Ville', 'Date d\'inscription', 'Services souscrits', 'Saisi par'])
    
    # Onglet 2: Suivi des Impôts
    ws2 = wb.create_sheet("Suivi des Impôts")
    ws2.append(['ID Client', 'Nom client', 'Type de déclaration', 'Année fiscale', 'Saisi par'])
    
    # Onglet 3: Tenue de livres et Taxes
    ws3 = wb.create_sheet("Tenue de livres et Taxes")
    ws3.append(['ID Client', 'Nom client', 'Saisi par'])
    
    # Onglet 4: Facturation
    ws4 = wb.create_sheet("Facturation")
    ws4.append(['N° Facture', 'ID Client', 'Nom client', 'Montant total', 'Statut paiement', 'Saisi par'])
    
    wb.save(EXCEL_FILE)
    print(f"✅ Fichier {EXCEL_FILE} créé avec succès.")

def insert_client_onboarding(data):
    """Injecte les données d'onboarding dans les onglets Excel respectifs."""
    initialize_excel_file()
    
    wb = load_workbook(EXCEL_FILE)
    
    # 1. Insertion dans "Répertoire Clients"
    ws_clients = wb["Répertoire Clients"]
    ws_clients.append([
        data.get("userId"),
        data.get("companyName") or data.get("displayName"),
        data.get("initialProfileType"),
        data.get("email"),
        data.get("phone"),
        data.get("city"),
        datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        ", ".join(data.get("services", [])),
        data.get("selectedExpertName", "Samuel") # Ancre du système (Saisi par)
    ])
    
    # 2. Insertion dans "Suivi des Impôts" (si services d'impôts cochés)
    if any("impôt" in s.lower() or "déclaration" in s.lower() for s in data.get("services", [])):
        ws_impots = wb["Suivi des Impôts"]
        ws_impots.append([
            data.get("userId"),
            data.get("displayName"),
            "T1/TP1 " + ("Autonome" if data.get("initialProfileType") == "business" else "Particulier"),
            str(datetime.datetime.now().year - 1),
            data.get("selectedExpertName", "Samuel")
        ])
        
    # 3. Insertion dans "Tenue de livres et Taxes" (si service mensuel coché)
    if any("tenue de livres" in s.lower() or "taxes" in s.lower() for s in data.get("services", [])):
        ws_tenue = wb["Tenue de livres et Taxes"]
        ws_tenue.append([
            data.get("userId"),
            data.get("companyName") or data.get("displayName"),
            data.get("selectedExpertName", "Samuel")
        ])
        
    wb.save(EXCEL_FILE)
    print(f"📊 Données client écrites dans {EXCEL_FILE}")

# Exemple d'appel :
if __name__ == "__main__":
    sample_payload = {
        "userId": "d7b88f34-1c9a-4122-83bb-92f7678bb111",
        "displayName": "Marie Tremblay",
        "email": "marie.tremblay@design.ca",
        "phone": "+1 514-555-0199",
        "city": "Montréal",
        "initialProfileType": "business",
        "companyName": "Tremblay Design Inc.",
        "services": ["Tenue de livres & Taxes", "Aide impôt autonome"],
        "selectedExpertName": "Eya"
    }
    insert_client_onboarding(sample_payload)
```

---

## 📧 3. Code d'Envoi SMTP (Python / SMTP Outlook)

Ce script utilise la connexion SMTP TLS sécurisée pour envoyer les courriels d'accueil et d'alerte d'équipe via l'adresse officielle `compta-flow@outlook.com` :

```python
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_SERVER = "smtp.office365.com"
SMTP_PORT = 587
EMAIL_SENDER = "compta-flow@outlook.com"
EMAIL_PASSWORD = "VOTRE_MOT_DE_PASSE_SECURE"  # Stocké dans les variables d'environnement

def send_onboarding_emails(client_name, client_email, expert_name):
    """Envoie l'email de bienvenue au client et l'alerte à l'équipe ComptaFlow."""
    try:
        # Initialisation de la connexion SMTP
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_SENDER, EMAIL_PASSWORD)
        
        # --- 1. EMAIL AU CLIENT ---
        msg_client = MIMEMultipart()
        msg_client['From'] = EMAIL_SENDER
        msg_client['To'] = client_email
        msg_client['Subject'] = f"Bienvenue chez Compta-Flow — Votre dossier est assigné à {expert_name}"
        
        body_client = f"""Bonjour {client_name},
        
Bienvenue au cabinet Compta-Flow ! 

Votre dossier a été assigné avec succès à votre experte comptable de référence : {expert_name}.

Pour commencer à collaborer :
1. Téléchargez l'application Dext sur votre mobile pour envoyer vos reçus en photo.
2. Signez votre mandat de gestion électronique via le courriel sécurisé DocuSign que vous recevrez sous peu.
3. Pour vos honoraires, vous pouvez effectuer vos règlements par Virement Interac à : compta-flow@outlook.com

Cordialement,
L'équipe Compta-Flow
compta-flow@outlook.com
"""
        msg_client.attach(MIMEText(body_client, 'plain', 'utf-8'))
        server.sendmail(EMAIL_SENDER, client_email, msg_client.as_string())
        print(f"📧 Courriel de bienvenue envoyé à {client_email}")
        
        # --- 2. ALERTE ÉQUIPE (Supervision) ---
        msg_team = MIMEMultipart()
        msg_team['From'] = EMAIL_SENDER
        msg_team['To'] = EMAIL_SENDER  # Alerte vers compta-flow@outlook.com
        msg_team['Subject'] = f"🚨 NOUVEAU DOSSIER CLIENT — Assigné à {expert_name}"
        
        body_team = f"""Équipe ComptaFlow,
        
Un nouveau dossier client a été ouvert :
- Client : {client_name}
- Courriel : {client_email}
- Expert Assigné : {expert_name}

Actions requises :
1. Mettre à jour le calendrier Outlook partagé.
2. Vérifier l'insertion correcte dans le fichier Excel "Portail - Compta-flow.xlsx".
3. Préparer l'environnement Intuit ProFile pour les futures déclarations fiscales.

--
Système d'automatisation Compta-Flow
"""
        msg_team.attach(MIMEText(body_team, 'plain', 'utf-8'))
        server.sendmail(EMAIL_SENDER, EMAIL_SENDER, msg_team.as_string())
        print("🚨 Alerte équipe transmise à supervision.")
        
        server.quit()
        
    except Exception as e:
        print(f"❌ Erreur lors de l'envoi des courriels : {str(e)}")

# Exemple d'appel :
if __name__ == "__main__":
    send_onboarding_emails("Marie Tremblay", "marie.tremblay@design.ca", "Eya")
```
