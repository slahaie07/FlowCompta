/**
 * Parcours procéduraux ComptaFlow — documents, informations et étapes par service vendu.
 * Source unique pour l'UI client et l'agent procedure-guide.
 */
import type { ServiceId } from './servicesCatalog';

export type ProcedurePortalPath =
  | 'overview'
  | 'services'
  | 'transactions'
  | 'invoices'
  | 'vault'
  | 'messaging'
  | 'support';

export interface ProcedureDocument {
  id: string;
  labelKey: string;
  required: boolean;
}

export interface ProcedureField {
  id: string;
  labelKey: string;
  required: boolean;
}

export interface ProcedureStep {
  id: string;
  order: number;
  titleKey: string;
  descKey: string;
  portalPath?: ProcedurePortalPath;
  documents: ProcedureDocument[];
  fields: ProcedureField[];
}

export interface ServiceProcedure {
  serviceId: ServiceId;
  estimatedDays: number;
  steps: ProcedureStep[];
}

const baseMandateStep = (order: number): ProcedureStep => ({
  id: 'mandate',
  order,
  titleKey: 'procedure.common.steps.mandate.title',
  descKey: 'procedure.common.steps.mandate.desc',
  portalPath: 'overview',
  documents: [
    { id: 'signed_mandate', labelKey: 'procedure.common.docs.signedMandate', required: true },
  ],
  fields: [
    { id: 'profile_complete', labelKey: 'procedure.common.fields.profileComplete', required: true },
    { id: 'province', labelKey: 'procedure.common.fields.province', required: true },
  ],
});

const baseVaultDocsStep = (order: number, docs: ProcedureDocument[]): ProcedureStep => ({
  id: 'documents',
  order,
  titleKey: 'procedure.common.steps.documents.title',
  descKey: 'procedure.common.steps.documents.desc',
  portalPath: 'vault',
  documents: docs,
  fields: [],
});

const baseCpaReviewStep = (order: number): ProcedureStep => ({
  id: 'cpa_review',
  order,
  titleKey: 'procedure.common.steps.cpaReview.title',
  descKey: 'procedure.common.steps.cpaReview.desc',
  portalPath: 'messaging',
  documents: [],
  fields: [
    { id: 'questions_answered', labelKey: 'procedure.common.fields.questionsAnswered', required: true },
  ],
});

const baseDeliveryStep = (order: number): ProcedureStep => ({
  id: 'delivery',
  order,
  titleKey: 'procedure.common.steps.delivery.title',
  descKey: 'procedure.common.steps.delivery.desc',
  portalPath: 'invoices',
  documents: [],
  fields: [
    { id: 'invoice_settled', labelKey: 'procedure.common.fields.invoiceSettled', required: true },
  ],
});

export const SERVICE_PROCEDURES: Record<ServiceId, ServiceProcedure> = {
  hourlyBookkeeping: {
    serviceId: 'hourlyBookkeeping',
    estimatedDays: 14,
    steps: [
      baseMandateStep(1),
      baseVaultDocsStep(2, [
        { id: 'bank_statements', labelKey: 'procedure.docs.bankStatements', required: true },
        { id: 'receipts', labelKey: 'procedure.docs.receipts', required: true },
        { id: 'prior_ledger', labelKey: 'procedure.docs.priorLedger', required: false },
      ]),
      {
        id: 'scope',
        order: 3,
        titleKey: 'procedure.hourlyBookkeeping.steps.scope.title',
        descKey: 'procedure.hourlyBookkeeping.steps.scope.desc',
        portalPath: 'messaging',
        documents: [],
        fields: [
          { id: 'period_range', labelKey: 'procedure.fields.periodRange', required: true },
          { id: 'volume_estimate', labelKey: 'procedure.fields.volumeEstimate', required: true },
        ],
      },
      {
        id: 'bookkeeping',
        order: 4,
        titleKey: 'procedure.hourlyBookkeeping.steps.work.title',
        descKey: 'procedure.hourlyBookkeeping.steps.work.desc',
        portalPath: 'transactions',
        documents: [],
        fields: [],
      },
      baseCpaReviewStep(5),
      baseDeliveryStep(6),
    ],
  },

  monthlyMicro: {
    serviceId: 'monthlyMicro',
    estimatedDays: 21,
    steps: [
      baseMandateStep(1),
      baseVaultDocsStep(2, [
        { id: 'bank_statements', labelKey: 'procedure.docs.bankStatements', required: true },
        { id: 'sales_invoices', labelKey: 'procedure.docs.salesInvoices', required: true },
        { id: 'expense_receipts', labelKey: 'procedure.docs.expenseReceipts', required: true },
      ]),
      {
        id: 'bank_access',
        order: 3,
        titleKey: 'procedure.monthly.steps.bankAccess.title',
        descKey: 'procedure.monthly.steps.bankAccess.desc',
        portalPath: 'messaging',
        documents: [],
        fields: [
          { id: 'bank_accounts', labelKey: 'procedure.fields.bankAccounts', required: true },
          { id: 'fiscal_year_end', labelKey: 'procedure.fields.fiscalYearEnd', required: true },
        ],
      },
      {
        id: 'monthly_cycle',
        order: 4,
        titleKey: 'procedure.monthlyMicro.steps.cycle.title',
        descKey: 'procedure.monthlyMicro.steps.cycle.desc',
        portalPath: 'transactions',
        documents: [],
        fields: [],
      },
      baseCpaReviewStep(5),
      baseDeliveryStep(6),
    ],
  },

  monthlySmall: {
    serviceId: 'monthlySmall',
    estimatedDays: 21,
    steps: [
      baseMandateStep(1),
      baseVaultDocsStep(2, [
        { id: 'bank_statements', labelKey: 'procedure.docs.bankStatements', required: true },
        { id: 'sales_invoices', labelKey: 'procedure.docs.salesInvoices', required: true },
        { id: 'expense_receipts', labelKey: 'procedure.docs.expenseReceipts', required: true },
        { id: 'credit_card', labelKey: 'procedure.docs.creditCard', required: true },
      ]),
      {
        id: 'bank_access',
        order: 3,
        titleKey: 'procedure.monthly.steps.bankAccess.title',
        descKey: 'procedure.monthly.steps.bankAccess.desc',
        portalPath: 'messaging',
        documents: [],
        fields: [
          { id: 'bank_accounts', labelKey: 'procedure.fields.bankAccounts', required: true },
          { id: 'employee_count', labelKey: 'procedure.fields.employeeCount', required: true },
        ],
      },
      {
        id: 'monthly_cycle',
        order: 4,
        titleKey: 'procedure.monthlySmall.steps.cycle.title',
        descKey: 'procedure.monthlySmall.steps.cycle.desc',
        portalPath: 'transactions',
        documents: [],
        fields: [],
      },
      baseCpaReviewStep(5),
      baseDeliveryStep(6),
    ],
  },

  monthlySme: {
    serviceId: 'monthlySme',
    estimatedDays: 30,
    steps: [
      baseMandateStep(1),
      baseVaultDocsStep(2, [
        { id: 'bank_statements', labelKey: 'procedure.docs.bankStatements', required: true },
        { id: 'sales_invoices', labelKey: 'procedure.docs.salesInvoices', required: true },
        { id: 'payroll_register', labelKey: 'procedure.docs.payrollRegister', required: true },
        { id: 'expense_receipts', labelKey: 'procedure.docs.expenseReceipts', required: true },
      ]),
      {
        id: 'payroll_setup',
        order: 3,
        titleKey: 'procedure.monthlySme.steps.payroll.title',
        descKey: 'procedure.monthlySme.steps.payroll.desc',
        portalPath: 'messaging',
        documents: [
          { id: 'employee_roster', labelKey: 'procedure.docs.employeeRoster', required: true },
        ],
        fields: [
          { id: 'pay_schedule', labelKey: 'procedure.fields.paySchedule', required: true },
        ],
      },
      {
        id: 'monthly_cycle',
        order: 4,
        titleKey: 'procedure.monthlySme.steps.cycle.title',
        descKey: 'procedure.monthlySme.steps.cycle.desc',
        portalPath: 'transactions',
        documents: [],
        fields: [],
      },
      baseCpaReviewStep(5),
      baseDeliveryStep(6),
    ],
  },

  gstQst: {
    serviceId: 'gstQst',
    estimatedDays: 10,
    steps: [
      baseMandateStep(1),
      {
        id: 'tax_numbers',
        order: 2,
        titleKey: 'procedure.gstQst.steps.taxNumbers.title',
        descKey: 'procedure.gstQst.steps.taxNumbers.desc',
        portalPath: 'overview',
        documents: [],
        fields: [
          { id: 'business_number', labelKey: 'procedure.fields.businessNumber', required: true },
          { id: 'gst_hst_account', labelKey: 'procedure.fields.gstAccount', required: true },
          { id: 'provincial_tax_account', labelKey: 'procedure.fields.provincialTaxAccount', required: false },
        ],
      },
      baseVaultDocsStep(3, [
        { id: 'sales_summary', labelKey: 'procedure.docs.salesSummary', required: true },
        { id: 'purchase_summary', labelKey: 'procedure.docs.purchaseSummary', required: true },
        { id: 'prior_filings', labelKey: 'procedure.docs.priorFilings', required: false },
      ]),
      {
        id: 'filing',
        order: 4,
        titleKey: 'procedure.gstQst.steps.filing.title',
        descKey: 'procedure.gstQst.steps.filing.desc',
        portalPath: 'transactions',
        documents: [],
        fields: [
          { id: 'reporting_period', labelKey: 'procedure.fields.reportingPeriod', required: true },
        ],
      },
      baseCpaReviewStep(5),
      baseDeliveryStep(6),
    ],
  },

  payroll: {
    serviceId: 'payroll',
    estimatedDays: 14,
    steps: [
      baseMandateStep(1),
      baseVaultDocsStep(2, [
        { id: 'employee_roster', labelKey: 'procedure.docs.employeeRoster', required: true },
        { id: 'void_cheque', labelKey: 'procedure.docs.voidCheque', required: true },
        { id: 'prior_pay_stubs', labelKey: 'procedure.docs.priorPayStubs', required: false },
      ]),
      {
        id: 'payroll_info',
        order: 3,
        titleKey: 'procedure.payroll.steps.info.title',
        descKey: 'procedure.payroll.steps.info.desc',
        portalPath: 'messaging',
        documents: [],
        fields: [
          { id: 'pay_frequency', labelKey: 'procedure.fields.payFrequency', required: true },
          { id: 'province_work', labelKey: 'procedure.fields.provinceWork', required: true },
          { id: 'employee_count', labelKey: 'procedure.fields.employeeCount', required: true },
        ],
      },
      {
        id: 'payroll_run',
        order: 4,
        titleKey: 'procedure.payroll.steps.run.title',
        descKey: 'procedure.payroll.steps.run.desc',
        portalPath: 'vault',
        documents: [],
        fields: [],
      },
      baseCpaReviewStep(5),
      baseDeliveryStep(6),
    ],
  },

  t4Releve1: {
    serviceId: 't4Releve1',
    estimatedDays: 21,
    steps: [
      baseMandateStep(1),
      baseVaultDocsStep(2, [
        { id: 'year_payroll_summary', labelKey: 'procedure.docs.yearPayrollSummary', required: true },
        { id: 'employee_roster', labelKey: 'procedure.docs.employeeRoster', required: true },
        { id: 'rl1_data_qc', labelKey: 'procedure.docs.rl1DataQc', required: false },
      ]),
      {
        id: 't4_prep',
        order: 3,
        titleKey: 'procedure.t4Releve1.steps.prep.title',
        descKey: 'procedure.t4Releve1.steps.prep.desc',
        portalPath: 'messaging',
        documents: [],
        fields: [
          { id: 'tax_year', labelKey: 'procedure.fields.taxYear', required: true },
        ],
      },
      {
        id: 't4_delivery',
        order: 4,
        titleKey: 'procedure.t4Releve1.steps.delivery.title',
        descKey: 'procedure.t4Releve1.steps.delivery.desc',
        portalPath: 'vault',
        documents: [
          { id: 't4_slips', labelKey: 'procedure.docs.t4Slips', required: true },
        ],
        fields: [],
      },
      baseCpaReviewStep(5),
      baseDeliveryStep(6),
    ],
  },

  catchUp: {
    serviceId: 'catchUp',
    estimatedDays: 45,
    steps: [
      baseMandateStep(1),
      {
        id: 'catchup_scope',
        order: 2,
        titleKey: 'procedure.catchUp.steps.scope.title',
        descKey: 'procedure.catchUp.steps.scope.desc',
        portalPath: 'messaging',
        documents: [],
        fields: [
          { id: 'months_behind', labelKey: 'procedure.fields.monthsBehind', required: true },
          { id: 'last_filed_period', labelKey: 'procedure.fields.lastFiledPeriod', required: true },
        ],
      },
      baseVaultDocsStep(3, [
        { id: 'all_bank_statements', labelKey: 'procedure.docs.allBankStatements', required: true },
        { id: 'all_receipts', labelKey: 'procedure.docs.allReceipts', required: true },
        { id: 'prior_returns', labelKey: 'procedure.docs.priorReturns', required: false },
      ]),
      {
        id: 'catchup_work',
        order: 4,
        titleKey: 'procedure.catchUp.steps.work.title',
        descKey: 'procedure.catchUp.steps.work.desc',
        portalPath: 'transactions',
        documents: [],
        fields: [],
      },
      baseCpaReviewStep(5),
      baseDeliveryStep(6),
    ],
  },

  softwareSetup: {
    serviceId: 'softwareSetup',
    estimatedDays: 7,
    steps: [
      baseMandateStep(1),
      {
        id: 'software_choice',
        order: 2,
        titleKey: 'procedure.softwareSetup.steps.choice.title',
        descKey: 'procedure.softwareSetup.steps.choice.desc',
        portalPath: 'messaging',
        documents: [],
        fields: [
          { id: 'software_name', labelKey: 'procedure.fields.softwareName', required: true },
          { id: 'chart_of_accounts', labelKey: 'procedure.fields.chartOfAccounts', required: false },
        ],
      },
      baseVaultDocsStep(3, [
        { id: 'opening_balances', labelKey: 'procedure.docs.openingBalances', required: true },
        { id: 'vendor_list', labelKey: 'procedure.docs.vendorList', required: false },
      ]),
      {
        id: 'setup_session',
        order: 4,
        titleKey: 'procedure.softwareSetup.steps.session.title',
        descKey: 'procedure.softwareSetup.steps.session.desc',
        portalPath: 'support',
        documents: [],
        fields: [],
      },
      baseCpaReviewStep(5),
      baseDeliveryStep(6),
    ],
  },

  taxHelpAutonomous: {
    serviceId: 'taxHelpAutonomous',
    estimatedDays: 14,
    steps: [
      baseMandateStep(1),
      baseVaultDocsStep(2, [
        { id: 't2125_support', labelKey: 'procedure.docs.t2125Support', required: true },
        { id: 'income_slips', labelKey: 'procedure.docs.incomeSlips', required: true },
        { id: 'expense_summary', labelKey: 'procedure.docs.expenseSummary', required: true },
      ]),
      {
        id: 'tax_organize',
        order: 3,
        titleKey: 'procedure.taxHelpAutonomous.steps.organize.title',
        descKey: 'procedure.taxHelpAutonomous.steps.organize.desc',
        portalPath: 'vault',
        documents: [],
        fields: [
          { id: 'tax_year', labelKey: 'procedure.fields.taxYear', required: true },
          { id: 'self_employment_type', labelKey: 'procedure.fields.selfEmploymentType', required: true },
        ],
      },
      baseCpaReviewStep(4),
      {
        id: 'cpa_handoff',
        order: 5,
        titleKey: 'procedure.taxHelpAutonomous.steps.handoff.title',
        descKey: 'procedure.taxHelpAutonomous.steps.handoff.desc',
        portalPath: 'messaging',
        documents: [
          { id: 'organized_package', labelKey: 'procedure.docs.organizedPackage', required: true },
        ],
        fields: [],
      },
      baseDeliveryStep(6),
    ],
  },
};

export function getServiceProcedure(serviceId: ServiceId): ServiceProcedure {
  return SERVICE_PROCEDURES[serviceId];
}

export function getActiveProcedures(
  selectedServiceId?: string,
  needs?: Record<string, boolean>
): ServiceProcedure[] {
  if (selectedServiceId && selectedServiceId in SERVICE_PROCEDURES) {
    return [SERVICE_PROCEDURES[selectedServiceId as ServiceId]];
  }
  if (needs && typeof needs === 'object') {
    return (Object.keys(SERVICE_PROCEDURES) as ServiceId[]).filter((id) => needs[id]).map(getServiceProcedure);
  }
  return [];
}

/** Résumé texte pour l'agent procedure-guide */
export function summarizeProcedureForAgent(procedure: ServiceProcedure, lang: 'fr' | 'en' | 'ar' = 'fr'): string {
  const lines = procedure.steps
    .sort((a, b) => a.order - b.order)
    .map((s) => `Étape ${s.order} (${s.id}): ${s.titleKey}${s.portalPath ? ` → /portal/client/${s.portalPath}` : ''}`);
  return `Service ${procedure.serviceId}, ~${procedure.estimatedDays} jours:\n${lines.join('\n')}`;
}

export function getProcedureProgressKey(userId: string, serviceId: ServiceId): string {
  return `comptaflow_procedure_${userId}_${serviceId}`;
}
