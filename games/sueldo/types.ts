
export interface SalaryBreakdown {
  grossAnnual: number;
  netAnnual: number;
  irpfAnnual: number;
  irpfStateAnnual: number;
  irpfCommunityAnnual: number;
  employeeSocialSecurityAnnual: number;
  employerSocialSecurityAnnual: number;
  totalCompanyCostAnnual: number;
  netMonthly: number;
}

export type Hypothesis = 'standard' | 'companyCostAsGross';

export interface BudgetCategory {
  area: string;
  percentage: number;
  totalAmount?: number;
}

export interface CalculationResult {
  standard: SalaryBreakdown;
  companyCostAsGross?: SalaryBreakdown;
  budgetDistribution: BudgetCategory[];
}

export type Language = 'es' | 'ca' | 'eu' | 'gl' | 'oc';

export interface Community {
  value: string;
  label: string;
}