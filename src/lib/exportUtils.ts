import { Document } from '../types';
import * as XLSX from 'xlsx';

/**
 * 🏛️ COMPTAFLOW UNIVERSAL EXPORT ENGINE
 * Transforme les données IA en formats compatibles avec les logiciels de production.
 */
export const ExportService = {
  
  /**
   * Format EXCEL (Audit & Manuel)
   */
  exportToExcel(documents: Document[]) {
    const data = documents.map(d => ({
      Date: d.metadata?.date || new Date(d.uploadDate).toLocaleDateString(),
      Émetteur: d.metadata?.emetteur || 'Inconnu',
      Catégorie: d.metadata?.categorie_depense || 'Général',
      'Montant HT': (d.metadata?.montant_total || 0) - (d.metadata?.tps || 0) - (d.metadata?.tvq || 0),
      TPS: d.metadata?.tps || 0,
      TVQ: d.metadata?.tvq || 0,
      Total: d.metadata?.montant_total || 0,
      Status: d.status,
      Lien: d.url
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Comptaflow_Export");
    XLSX.writeFile(wb, `AGY_Export_Excel_${Date.now()}.xlsx`);
  },

  /**
   * Format QUICKBOOKS (IIF/CSV)
   */
  exportToQuickBooks(documents: Document[]) {
    // Structure simplifiée pour import QuickBooks Online
    const headers = "Date,Description,Amount,TaxAmount,TransactionType\n";
    const rows = documents.map(d => {
      const amount = d.metadata?.montant_total || 0;
      const tax = (d.metadata?.tps || 0) + (d.metadata?.tvq || 0);
      return `${d.metadata?.date || ''},${d.metadata?.emetteur || ''},${amount},${tax},Expense`;
    }).join("\n");

    this.downloadFile(headers + rows, "AGY_QuickBooks_Import.csv", "text/csv");
  },

  /**
   * Format SAGE (CSV)
   */
  exportToSage(documents: Document[]) {
    // Format spécifique Sage 50 / Business Cloud
    const rows = documents.map(d => {
      return `JOURNAL,${d.metadata?.date || ''},${d.metadata?.emetteur || ''},${d.metadata?.montant_total || 0},${d.metadata?.tps || 0},${d.metadata?.tvq || 0}`;
    }).join("\n");

    this.downloadFile(rows, "AGY_Sage_Import.csv", "text/csv");
  },

  exportTransactions(transactions: any[], clientName: string) {
    const data = transactions.map(t => ({
      Date: new Date(t.date).toLocaleDateString(),
      Description: t.description,
      Catégorie: t.category || 'Général',
      Type: t.type === 'sale' ? 'Revenu' : 'Dépense',
      Montant: t.amount,
      Status: t.status
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, `Export_${clientName.replace(/\s+/g, '_')}_${Date.now()}.xlsx`);
  },

  downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }
};
