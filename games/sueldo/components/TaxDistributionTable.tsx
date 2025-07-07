import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { BudgetCategory } from '../types';
import UsersGroupIcon from './icons/UsersGroupIcon';
import BanknotesIcon from './icons/BanknotesIcon';
import ArrowsRightLeftIcon from './icons/ArrowsRightLeftIcon';
import UserMinusIcon from './icons/UserMinusIcon';
import HeartIcon from './icons/HeartIcon';
import AcademicCapIcon from './icons/AcademicCapIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon';
import EllipsisHorizontalIcon from './icons/EllipsisHorizontalIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import ScaleIcon from './icons/ScaleIcon';
import CrownIcon from './icons/CrownIcon';
import ArchiveBoxIcon from './icons/ArchiveBoxIcon';

interface TaxDistributionTableProps {
  data: BudgetCategory[];
  totalContribution: number;
  period: 'annual' | 'monthly';
}

const formatCurrency = (value: number) => {
    return value.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    });
};

const categoryDetails: { [key: string]: { icon: React.FC<{className?: string}>; tKey: string } } = {
    'Pensions': { icon: UsersGroupIcon, tKey: 'budgetAreas.Pensions' },
    'Public Debt Interest': { icon: BanknotesIcon, tKey: 'budgetAreas.Public Debt Interest' },
    'Transfers to other Public Administrations': { icon: ArrowsRightLeftIcon, tKey: 'budgetAreas.Transfers to other Public Administrations' },
    'Unemployment benefits': { icon: UserMinusIcon, tKey: 'budgetAreas.Unemployment benefits' },
    'Healthcare': { icon: HeartIcon, tKey: 'budgetAreas.Healthcare' },
    'Education': { icon: AcademicCapIcon, tKey: 'budgetAreas.Education' },
    'Defense': { icon: ShieldCheckIcon, tKey: 'budgetAreas.Defense' },
    'Economic Affairs': { icon: ChartBarIcon, tKey: 'budgetAreas.Economic Affairs' },
    'General Administration': { icon: ArchiveBoxIcon, tKey: 'budgetAreas.General Administration' },
    'High State Institutions': { icon: ScaleIcon, tKey: 'budgetAreas.High State Institutions' },
    'Casa Real': { icon: CrownIcon, tKey: 'budgetAreas.Casa Real' },
    'Other': { icon: EllipsisHorizontalIcon, tKey: 'budgetAreas.Other' },
};

const TaxDistributionTable: React.FC<TaxDistributionTableProps> = ({ data, totalContribution, period }) => {
  const { t } = useTranslation();
  const divisor = period === 'annual' ? 1 : 12;

  const sortedData = [...data].sort((a, b) => b.percentage - a.percentage);

  return (
    <section className="bg-slate-800 p-4 sm:p-6 rounded-xl border border-slate-700">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-2">
        {t('results.taxDistribution.title')}
      </h2>
      <p className="text-center text-slate-400 mb-6 text-sm sm:text-base">
        {t('results.taxDistribution.description')}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left table-auto">
          <thead className="border-b-2 border-slate-600">
            <tr>
              <th className="p-2 sm:p-4 text-sm font-semibold text-slate-300 tracking-wider">{t('results.taxDistribution.category')}</th>
              <th className="p-2 sm:p-4 text-sm font-semibold text-slate-300 tracking-wider text-right">{t('results.taxDistribution.totalBudgeted')}</th>
              <th className="p-2 sm:p-4 text-sm font-semibold text-slate-300 tracking-wider text-right">{t('results.taxDistribution.percentage')}</th>
              <th className="p-2 sm:p-4 text-sm font-semibold text-slate-300 tracking-wider text-right">{t('results.taxDistribution.yourContribution')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item) => {
              const details = categoryDetails[item.area];
              if (!details) return null;
              const Icon = details.icon;
              return (
                <tr key={item.area} className="border-b border-slate-700 last:border-b-0 hover:bg-slate-700/50 transition-colors">
                  <td className="p-3 sm:p-4 text-slate-100 font-medium">
                    <div className="flex items-center gap-3">
                        <Icon className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                        <span className="text-sm sm:text-base">{t(details.tKey)}</span>
                    </div>
                  </td>
                   <td className="p-3 sm:p-4 text-slate-100 text-right font-mono text-sm sm:text-base">
                    {item.totalAmount ? formatCurrency(item.totalAmount) : 'N/A'}
                  </td>
                  <td className="p-3 sm:p-4 text-slate-100 text-right font-mono text-sm sm:text-base">{item.percentage.toFixed(3)}%</td>
                  <td className="p-3 sm:p-4 text-white text-right font-semibold font-mono text-sm sm:text-base">
                    {formatCurrency((totalContribution * (item.percentage / 100)) / divisor)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TaxDistributionTable;