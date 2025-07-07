
import React from 'react';
import EuroIcon from './icons/EuroIcon';
import { Community } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface SalaryInputFormProps {
  grossAnnualSalary: string;
  setGrossAnnualSalary: (value: string) => void;
  community: string;
  setCommunity: (value: string) => void;
  onCalculate: (salary: number, community: string) => void;
  isLoading: boolean;
}
  
const SalaryInputForm: React.FC<SalaryInputFormProps> = ({
  grossAnnualSalary,
  setGrossAnnualSalary,
  community,
  setCommunity,
  onCalculate,
  isLoading,
}) => {
  const { t } = useTranslation();
  const communities: Community[] = t('communities', {}, true) as Community[];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const salaryNumber = parseFloat(grossAnnualSalary);
    if (!isNaN(salaryNumber) && salaryNumber > 0) {
      onCalculate(salaryNumber, community);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-slate-800 rounded-xl shadow-lg border border-slate-700 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label htmlFor="gross-salary" className="block text-lg font-medium text-slate-300 mb-2">
            {t('form.grossAnnualLabel')}
            </label>
            <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <EuroIcon className="h-6 w-6 text-slate-400" />
            </div>
            <input
                type="number"
                id="gross-salary"
                name="gross-salary"
                value={grossAnnualSalary}
                onChange={(e) => setGrossAnnualSalary(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-2xl font-semibold bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors"
                placeholder={t('form.placeholder')}
                required
                min="1"
                disabled={isLoading}
            />
            </div>
        </div>
        
        <div>
            <label htmlFor="community" className="block text-lg font-medium text-slate-300 mb-2">
            {t('form.communityLabel')}
            </label>
            <select
            id="community"
            name="community"
            value={community}
            onChange={(e) => setCommunity(e.target.value)}
            disabled={isLoading}
            className="w-full pl-4 pr-10 py-4 text-xl bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors appearance-none bg-no-repeat bg-right-4"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundSize: '1.5em 1.5em' }}
            >
            {communities.sort((a,b) => a.label.localeCompare(b.label)).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
        </div>
      </div>
      
      <button
        type="submit"
        disabled={isLoading || !grossAnnualSalary}
        className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? t('form.calculatingButton') : t('form.calculateButton')}
      </button>
    </form>
  );
};

export default SalaryInputForm;