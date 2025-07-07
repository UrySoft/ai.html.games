import { SalaryBreakdown, CalculationResult, BudgetCategory } from '../types';

// --- Hardcoded Data ---

// Based on 2024 regulations
const SS_CONSTANTS = {
  // Rates: 4.8% common contingencies + 1.55% unemployment + 0.1% professional training
  employeeRate: 0.0645, 
  // Rates: 23.6% cc + 5.5% unemployment + 0.6% FOGASA + 0.2% FP + 1.7% MEI... simplified for this app
  employerRate: 0.316, 
  maxContributionBase: 4720.50 * 12, // 56646 annually
};

const IRPF_GENERAL_DEDUCTION = 2000;

// 2024 State IRPF brackets
const STATE_IRPF_BRACKETS = [
  { limit: 12450, rate: 0.095 },
  { limit: 20200, rate: 0.12 },
  { limit: 35200, rate: 0.15 },
  { limit: 60000, rate: 0.185 },
  { limit: 300000, rate: 0.225 },
  { limit: Infinity, rate: 0.235 },
];

// 2024 Regional IRPF brackets (a selection of communities, with a default)
const REGIONAL_IRPF_BRACKETS: Record<string, { limit: number; rate: number }[]> = {
  'Andalucía': [ { limit: 13872, rate: 0.095 }, { limit: 25472, rate: 0.1185 }, { limit: 37072, rate: 0.1485 }, { limit: 60000, rate: 0.183 }, { limit: Infinity, rate: 0.225 } ],
  'Aragón': [ { limit: 14070, rate: 0.095 }, { limit: 22200, rate: 0.12 }, { limit: 36600, rate: 0.15 }, { limit: 55000, rate: 0.185 }, { limit: Infinity, rate: 0.255 } ],
  'Asturias': [ { limit: 12450, rate: 0.10 }, { limit: 17707, rate: 0.12 }, { limit: 33007, rate: 0.15 }, { limit: 53407, rate: 0.185 }, { limit: Infinity, rate: 0.245 } ],
  'Baleares': [ { limit: 10000, rate: 0.095 }, { limit: 18000, rate: 0.115 }, { limit: 30000, rate: 0.135 }, { limit: 48000, rate: 0.185 }, { limit: 70000, rate: 0.22 }, { limit: Infinity, rate: 0.235 } ],
  'Canarias': [ { limit: 12450, rate: 0.09 }, { limit: 17707, rate: 0.115 }, { limit: 33007, rate: 0.14 }, { limit: 53407, rate: 0.18 }, { limit: 90000, rate: 0.23 }, { limit: Infinity, rate: 0.25 } ],
  'Cantabria': [ { limit: 13350, rate: 0.095 }, { limit: 21600, rate: 0.12 }, { limit: 36400, rate: 0.15 }, { limit: 61800, rate: 0.185 }, { limit: Infinity, rate: 0.225 } ],
  'Castilla-La Mancha': [ { limit: 12450, rate: 0.095 }, { limit: 20200, rate: 0.115 }, { limit: 35200, rate: 0.14 }, { limit: 60000, rate: 0.18 }, { limit: Infinity, rate: 0.225 } ],
  'Castilla y León': [ { limit: 12450, rate: 0.09 }, { limit: 20200, rate: 0.115 }, { limit: 35200, rate: 0.14 }, { limit: 60000, rate: 0.18 }, { limit: Infinity, rate: 0.21 } ],
  'Cataluña': [ { limit: 12450, rate: 0.10 }, { limit: 20200, rate: 0.12 }, { limit: 35200, rate: 0.15 }, { limit: 60000, rate: 0.185 }, { limit: 175000, rate: 0.215 }, { limit: Infinity, rate: 0.25 } ],
  'Comunidad Valenciana': [ { limit: 12450, rate: 0.09 }, { limit: 20200, rate: 0.12 }, { limit: 35200, rate: 0.15 }, { limit: 60000, rate: 0.185 }, { limit: 175000, rate: 0.215 }, { limit: Infinity, rate: 0.295 } ],
  'Extremadura': [ { limit: 12450, rate: 0.095 }, { limit: 19500, rate: 0.125 }, { limit: 33000, rate: 0.155 }, { limit: 60000, rate: 0.19 }, { limit: Infinity, rate: 0.25 } ],
  'Galicia': [ { limit: 12450, rate: 0.09 }, { limit: 20200, rate: 0.115 }, { limit: 35200, rate: 0.14 }, { limit: 60000, rate: 0.18 }, { limit: Infinity, rate: 0.225 } ],
  'Madrid': [ { limit: 13500, rate: 0.085 }, { limit: 19000, rate: 0.107 }, { limit: 35200, rate: 0.128 }, { limit: 60000, rate: 0.174 }, { limit: Infinity, rate: 0.205 } ],
  'Murcia': [ { limit: 12450, rate: 0.095 }, { limit: 20200, rate: 0.116 }, { limit: 35200, rate: 0.146 }, { limit: 60000, rate: 0.181 }, { limit: Infinity, rate: 0.226 } ],
  'La Rioja': [ { limit: 12450, rate: 0.09 }, { limit: 20200, rate: 0.115 }, { limit: 35200, rate: 0.14 }, { limit: 60000, rate: 0.18 }, { limit: Infinity, rate: 0.24 } ],
  // Foral communities have special regimes not simulated here, so we use 'default'
  'Navarra': STATE_IRPF_BRACKETS, 
  'País Vasco': STATE_IRPF_BRACKETS,
  'Ceuta': STATE_IRPF_BRACKETS,
  'Melilla': STATE_IRPF_BRACKETS,
  'default': STATE_IRPF_BRACKETS // A fallback
};

const BUDGET_DISTRIBUTION: BudgetCategory[] = [
    { "area": "Pensions", "percentage": 40.5, "totalAmount": 190687000000 },
    { "area": "Transfers to other Public Administrations", "percentage": 15.2, "totalAmount": 70345000000 },
    { "area": "Public Debt Interest", "percentage": 7.3, "totalAmount": 31275000000 },
    { "area": "Unemployment benefits", "percentage": 6.8, "totalAmount": 29654000000 },
    { "area": "Healthcare", "percentage": 5.8, "totalAmount": 27432000000 },
    { "area": "Economic Affairs", "percentage": 5.5, "totalAmount": 25112000000 },
    { "area": "Education", "percentage": 3.1, "totalAmount": 14612000000 },
    { "area": "General Administration", "percentage": 2.880, "totalAmount": 13428600000 },
    { "area": "Defense", "percentage": 2.8, "totalAmount": 12825000000 },
    { "area": "High State Institutions", "percentage": 0.120, "totalAmount": 558400000 },
    { "area": "Other", "percentage": 9.998, "totalAmount": 47234000000 },
    { "area": "Casa Real", "percentage": 0.002, "totalAmount": 8430000 }
];


// --- Calculation Logic ---

const calculateProgressiveTax = (base: number, brackets: { limit: number; rate: number }[]): number => {
    let tax = 0;
    let previousLimit = 0;
    for (const bracket of brackets) {
        if (base > previousLimit) {
            const taxableInBracket = Math.min(base - previousLimit, bracket.limit - previousLimit);
            tax += taxableInBracket * bracket.rate;
        }
        previousLimit = bracket.limit;
    }
    return tax;
};


const performCalculation = (grossAnnual: number, community: string, isHypothesis: boolean = false): SalaryBreakdown => {
    const contributionBase = Math.min(grossAnnual, SS_CONSTANTS.maxContributionBase);
    
    const employeeSocialSecurityAnnual = contributionBase * SS_CONSTANTS.employeeRate;
    
    const employerSocialSecurityAnnual = isHypothesis ? 0 : contributionBase * SS_CONSTANTS.employerRate;

    const irpfBase = Math.max(0, grossAnnual - employeeSocialSecurityAnnual - IRPF_GENERAL_DEDUCTION);
    
    const regionalBrackets = REGIONAL_IRPF_BRACKETS[community] || REGIONAL_IRPF_BRACKETS['default'];

    const irpfStateAnnual = calculateProgressiveTax(irpfBase, STATE_IRPF_BRACKETS);
    const irpfCommunityAnnual = calculateProgressiveTax(irpfBase, regionalBrackets);
    const irpfAnnual = irpfStateAnnual + irpfCommunityAnnual;
    
    const netAnnual = grossAnnual - irpfAnnual - employeeSocialSecurityAnnual;
    const netMonthly = netAnnual / 12;

    const totalCompanyCostAnnual = grossAnnual + employerSocialSecurityAnnual;

    return {
        grossAnnual,
        netAnnual,
        irpfAnnual,
        irpfStateAnnual,
        irpfCommunityAnnual,
        employeeSocialSecurityAnnual,
        employerSocialSecurityAnnual,
        totalCompanyCostAnnual,
        netMonthly,
    };
};


export const calculateSalaryBreakdown = (
    grossSalary: number, 
    community: string
): CalculationResult => {

    if (grossSalary <= 0 || !community) {
        throw new Error("Invalid input for calculation");
    }

    const standardResult = performCalculation(grossSalary, community, false);

    const newGrossSalaryForHypothesis = standardResult.totalCompanyCostAnnual;
    const hypothesisResult = performCalculation(newGrossSalaryForHypothesis, community, true);

    return {
        standard: standardResult,
        companyCostAsGross: hypothesisResult,
        budgetDistribution: BUDGET_DISTRIBUTION,
    };
};