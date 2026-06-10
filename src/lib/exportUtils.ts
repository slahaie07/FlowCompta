import { Transaction, Invoice } from '../types';

/**
 * Utilitaire d'exportation ComptaFlow
 * Permet de générer des fichiers CSV (Excel-compatible) à partir des données de l'application.
 */

export const exportToCSV = (data: any[], fileName: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => 
    Object.values(obj)
      .map(val => {
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(',')
  );

  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Formatage spécifique pour les transactions (Excel Pro)
 */
export const exportTransactionsExcel = (transactions: Transaction[], clientName: string) => {
  const formatted = transactions.map(t => ({
    Date: new Date(t.date).toLocaleDateString('fr-CA'),
    Description: t.description,
    Type: t.type === 'sale' ? 'Vente' : 'Achat',
    Montant: t.amount,
    Statut: t.status,
    Categorie: t.category,
    Profil: t.context
  }));

  exportToCSV(formatted, `Rapport_Transactions_${clientName.replace(/\s+/g, '_')}`);
};

/**
 * Formatage spécifique pour les factures (Excel Pro)
 */
export const exportInvoicesExcel = (invoices: Invoice[], clientName: string) => {
  const formatted = invoices.map(i => ({
    Numero: i.number,
    Date: new Date(i.date).toLocaleDateString('fr-CA'),
    Echeance: new Date(i.dueDate).toLocaleDateString('fr-CA'),
    Client: i.clientName,
    Montant: i.amount,
    Statut: i.status
  }));

  exportToCSV(formatted, `Registre_Factures_${clientName.replace(/\s+/g, '_')}`);
};
