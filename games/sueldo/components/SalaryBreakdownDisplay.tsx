
import React, { useState } from 'react';
import { SalaryBreakdown, CalculationResult, Hypothesis } from '../types';
import SalaryPieChart from './SalaryPieChart';
import BuildingOfficeIcon from './icons/BuildingOfficeIcon';
import UserIcon from './icons/UserIcon';
import BuildingLibraryIcon from './icons/BuildingLibraryIcon';
import MapPinIcon from './icons/MapPinIcon';
import { useTranslation } from '../hooks/useTranslation';
import TaxDistributionTable from './TaxDistributionTable';

const formatCurrency = (value: number) => {
  return value.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  });
};

const BreakdownCard: React.FC<{
  label: string;
  value: number;
  percentage?: number;
  percentageContext?: string;
  colorClass: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ label, value, percentage, percentageContext, colorClass, icon, children }) => {
  return (
    <div>
      <div className={`bg-slate-800 p-4 rounded-lg border-l-4 ${colorClass} shadow-md`}>
        <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-3">
                {icon}
                <h3 className="text-base sm:text-lg font-bold text-white">{label}</h3>
            </div>
          <div className="text-right">
            <p className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              {formatCurrency(value)}
            </p>
            {percentage !== undefined && (
              <div className="text-sm text-slate-400 mt-1">
                <span className="font-bold text-slate-200">{percentage.toFixed(1)}%</span>
                {percentageContext && ` ${percentageContext}`}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {children && <div className="pl-4 sm:pl-6 mt-4 space-y-4">{children}</div>}
    </div>
  );
};


interface SalaryBreakdownDisplayProps {
  result: CalculationResult;
  hypothesis: Hypothesis;
  setHypothesis: (hypothesis: Hypothesis) => void;
}

const SalaryBreakdownDisplay: React.FC<SalaryBreakdownDisplayProps> = ({ result, hypothesis, setHypothesis }) => {
  const { t } = useTranslation();
  const [view, setView] = useState<'annual' | 'monthly'>('annual');

  const hypothesisOptions: { id: Hypothesis; label: string; description: string }[] = [
    { 
        id: 'standard', 
        label: t('results.hypothesis.standard.label'), 
        description: t('results.hypothesis.standard.description')
    },
    { 
        id: 'companyCostAsGross', 
        label: t('results.hypothesis.companyCost.label'), 
        description: t('results.hypothesis.companyCost.description')
    },
];
  
  const breakdown = (hypothesis === 'companyCostAsGross' && result.companyCostAsGross)
    ? result.companyCostAsGross
    : result.standard;
  
  const divisor = view === 'annual' ? 1 : 12;
  const activeHypothesisInfo = hypothesisOptions.find(h => h.id === hypothesis) ?? hypothesisOptions[0];

  const { 
    grossAnnual, netAnnual, irpfAnnual, irpfStateAnnual, irpfCommunityAnnual, 
    employeeSocialSecurityAnnual, employerSocialSecurityAnnual, totalCompanyCostAnnual 
  } = breakdown;

  const totalTaxesAndContributions = employerSocialSecurityAnnual + employeeSocialSecurityAnnual + irpfAnnual;
  const totalNetForEmployee = netAnnual;

  const totalTaxesAndContributionsPercent = totalCompanyCostAnnual > 0 ? (totalTaxesAndContributions / totalCompanyCostAnnual) * 100 : 0;
  const totalNetForEmployeePercent = totalCompanyCostAnnual > 0 ? (totalNetForEmployee / totalCompanyCostAnnual) * 100 : 0;
  
  const totalUserContribution = irpfAnnual + employeeSocialSecurityAnnual;


  const renderBreakdown = () => {
    const employeeContributionsTotal = irpfAnnual + employeeSocialSecurityAnnual;
    const iconClasses = "w-6 h-6 text-slate-400";
    
    const grossToTotalPercent = totalCompanyCostAnnual > 0 ? (grossAnnual / totalCompanyCostAnnual) * 100 : 0;
    const employerSSToTotalPercent = totalCompanyCostAnnual > 0 ? (employerSocialSecurityAnnual / totalCompanyCostAnnual) * 100 : 0;
    const netToGrossPercent = grossAnnual > 0 ? (netAnnual / grossAnnual) * 100 : 0;
    const employeeContributionsToGrossPercent = grossAnnual > 0 ? (employeeContributionsTotal / grossAnnual) * 100 : 0;
    const irpfToEmployeeContributionsPercent = employeeContributionsTotal > 0 ? (irpfAnnual / employeeContributionsTotal) * 100 : 0;
    const employeeSSToEmployeeContributionsPercent = employeeContributionsTotal > 0 ? (employeeSocialSecurityAnnual / employeeContributionsTotal) * 100 : 0;
    const irpfStateToIrpfTotalPercent = irpfAnnual > 0 ? (irpfStateAnnual / irpfAnnual) * 100 : 0;
    const irpfCommunityToIrpfTotalPercent = irpfAnnual > 0 ? (irpfCommunityAnnual / irpfAnnual) * 100 : 0;

    return (
      <BreakdownCard
        label={t('breakdown.companyCost.label')}
        value={totalCompanyCostAnnual / divisor}
        percentage={100}
        colorClass="border-cyan-500"
        icon={<BuildingOfficeIcon className={iconClasses} />}
      >
        <BreakdownCard
          label={t('breakdown.grossSalary.label')}
          value={grossAnnual / divisor}
          percentage={grossToTotalPercent}
          percentageContext={t('breakdown.context.ofTotal')}
          colorClass="border-purple-500"
          icon={<UserIcon className={iconClasses} />}
        >
          <BreakdownCard
            label={t('breakdown.netSalary.label')}
            value={netAnnual / divisor}
            percentage={netToGrossPercent}
            percentageContext={t('breakdown.context.ofGross')}
            colorClass="border-green-500"
            icon={<UserIcon className={iconClasses} />}
          />
          <BreakdownCard
            label={t('breakdown.employeeContributions.label')}
            value={employeeContributionsTotal / divisor}
            percentage={employeeContributionsToGrossPercent}
            percentageContext={t('breakdown.context.ofGross')}
            colorClass="border-yellow-500"
            icon={<UserIcon className={iconClasses} />}
          >
            <BreakdownCard
              label={t('breakdown.irpf.label')}
              value={irpfAnnual / divisor}
              percentage={irpfToEmployeeContributionsPercent}
              percentageContext={t('breakdown.context.ofContributions')}
              colorClass="border-amber-500"
              icon={<BuildingLibraryIcon className={iconClasses} />}
            >
              <BreakdownCard
                label={t('breakdown.irpfState.label')}
                value={irpfStateAnnual / divisor}
                percentage={irpfStateToIrpfTotalPercent}
                percentageContext={t('breakdown.context.ofIrpf')}
                colorClass="border-orange-500"
                icon={<BuildingLibraryIcon className={iconClasses} />}
              />
              <BreakdownCard
                label={t('breakdown.irpfCommunity.label')}
                value={irpfCommunityAnnual / divisor}
                percentage={irpfCommunityToIrpfTotalPercent}
                percentageContext={t('breakdown.context.ofIrpf')}
                colorClass="border-orange-600"
                icon={<MapPinIcon className={iconClasses} />}
              />
            </BreakdownCard>
            <BreakdownCard
              label={t('breakdown.ssEmployee.label')}
              value={employeeSocialSecurityAnnual / divisor}
              percentage={employeeSSToEmployeeContributionsPercent}
              percentageContext={t('breakdown.context.ofContributions')}
              colorClass="border-rose-500"
              icon={<UserIcon className={iconClasses} />}
            />
          </BreakdownCard>
        </BreakdownCard>
        {employerSocialSecurityAnnual > 0 &&
          <BreakdownCard
            label={t('breakdown.ssEmployer.label')}
            value={employerSocialSecurityAnnual / divisor}
            percentage={employerSSToTotalPercent}
            percentageContext={t('breakdown.context.ofTotal')}
            colorClass="border-red-500"
            icon={<BuildingOfficeIcon className={iconClasses} />}
          />
        }
      </BreakdownCard>
    );
  }
  
  const iconClassesSummary = "w-8 h-8 text-slate-400 mb-2";

  return (
    <div className="space-y-10">
      <section className="bg-slate-800 p-4 sm:p-6 rounded-xl border border-slate-700 space-y-4">
        <div className="flex flex-col md:flex-row justify-center items-center gap-2">
            {hypothesisOptions.map((option) => (
                <button
                    key={option.id}
                    onClick={() => setHypothesis(option.id)}
                    className={`w-full md:w-auto flex-1 px-4 py-2 rounded-md text-base font-bold transition-colors ${
                        hypothesis === option.id 
                        ? 'bg-cyan-600 text-white shadow-md' 
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                    aria-pressed={hypothesis === option.id}
                >
                    {option.label}
                </button>
            ))}
        </div>
        <header className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
            <div className="text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">{activeHypothesisInfo.label}</h2>
                <p className="text-slate-400 mt-1 max-w-2xl">{activeHypothesisInfo.description}</p>
            </div>
            <div className="flex-shrink-0 bg-slate-900/50 p-1 rounded-lg border border-slate-600">
                <button onClick={() => setView('annual')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'annual' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`} aria-pressed={view === 'annual'}>{t('results.switch.annual')}</button>
                <button onClick={() => setView('monthly')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'monthly' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`} aria-pressed={view === 'monthly'}>{t('results.switch.monthly')}</button>
            </div>
        </header>
      </section>

      <section>
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-4">{t('results.summary.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-lg bg-slate-800 border-l-4 border-cyan-500 flex flex-col items-center justify-center">
            <BuildingOfficeIcon className={iconClassesSummary} />
            <p className="text-sm font-medium text-slate-300">{t('results.summary.company.label')}</p>
            <p className="text-3xl font-bold text-white mt-1">{formatCurrency(totalCompanyCostAnnual / divisor)}</p>
            <p className="text-base font-medium text-slate-400 mt-1">100%</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800 border-l-4 border-red-500 flex flex-col items-center justify-center">
            <BuildingLibraryIcon className={iconClassesSummary} />
            <p className="text-sm font-medium text-slate-300">{t('results.summary.state.label')}</p>
            <p className="text-3xl font-bold text-white mt-1">{formatCurrency(totalTaxesAndContributions / divisor)}</p>
            <p className="text-base font-medium text-slate-400 mt-1">{t('results.summary.percentOfTotal', { percent: totalTaxesAndContributionsPercent.toFixed(1) })}</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800 border-l-4 border-green-500 flex flex-col items-center justify-center">
            <UserIcon className={iconClassesSummary} />
            <p className="text-sm font-medium text-slate-300">{t('results.summary.employee.label')}</p>
            <p className="text-3xl font-bold text-white mt-1">{formatCurrency(totalNetForEmployee / divisor)}</p>
            <p className="text-base font-medium text-slate-400 mt-1">{t('results.summary.percentOfTotal', { percent: totalNetForEmployeePercent.toFixed(1) })}</p>
          </div>
        </div>
      </section>
      
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-6 mt-10">{t('results.detailed.title')}</h2>
        {renderBreakdown()}
      </div>
      
      {result.budgetDistribution && result.budgetDistribution.length > 0 &&
        <div className="pt-4">
            <TaxDistributionTable 
                data={result.budgetDistribution}
                totalContribution={totalUserContribution}
                period={view}
            />
        </div>
      }

      <div className="space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white">{t('results.visual.title')}</h2>
          <div className="pt-4">
               <SalaryPieChart breakdown={breakdown} period={view} />
          </div>
      </div>
    </div>
  );
};

export default SalaryBreakdownDisplay;
