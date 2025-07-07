import React, { useState } from 'react';
import { CalculationResult, Hypothesis } from './types';
import { calculateSalaryBreakdown } from './services/geminiService';
import SalaryInputForm from './components/SalaryInputForm';
import SalaryBreakdownDisplay from './components/SalaryBreakdownDisplay';
import Spinner from './components/common/Spinner';
import CalculatorIcon from './components/icons/CalculatorIcon';
import LanguageSelector from './components/LanguageSelector';
import { useTranslation } from './hooks/useTranslation';
import ExternalLinkIcon from './components/icons/ExternalLinkIcon';

interface ReferenceItem {
  title: string;
  description: string;
  url: string;
}

const App: React.FC = () => {
  const { t, loading: i18nLoading } = useTranslation();
  const [grossAnnualSalary, setGrossAnnualSalary] = useState<string>('30000');
  const [community, setCommunity] = useState<string>('Madrid');
  const [hypothesis, setHypothesis] = useState<Hypothesis>('standard');
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const references: ReferenceItem[] = t('references.items', undefined, true);

  const handleCalculate = (salary: number, selectedCommunity: string) => {
    setIsLoading(true);
    setError(null);
    setCalculationResult(null);

    // Use a short timeout to ensure the UI updates to show the spinner
    setTimeout(() => {
        try {
            const result = calculateSalaryBreakdown(salary, selectedCommunity);
            setCalculationResult(result);
            setHypothesis('standard'); // Reset view to standard on new calculation
        } catch (err) {
            console.error(err);
            setError(t('error.defaultMessage'));
        } finally {
            setIsLoading(false);
        }
    }, 50); // A small delay like 50ms is enough
  };

  if (i18nLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <header className="relative text-center mb-8">
          <div className="absolute top-0 right-0">
            <LanguageSelector />
          </div>
          <div className="flex items-center justify-center gap-4 mb-2 pt-12 sm:pt-4">
            <CalculatorIcon className="h-10 w-10 text-cyan-400" />
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              {t('app.title')}
            </h1>
          </div>
          <p className="text-lg text-slate-400">
            {t('app.subtitle')}
          </p>
          <p className="text-sm text-slate-400 mt-2">
            {t('app.author.prefix')} <a href="https://www.linkedin.com/in/oriol-badia" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline">Oriol Badia Campanera</a>
          </p>
        </header>

        <main className="flex flex-col gap-8">
          <SalaryInputForm
            grossAnnualSalary={grossAnnualSalary}
            setGrossAnnualSalary={setGrossAnnualSalary}
            community={community}
            setCommunity={setCommunity}
            onCalculate={handleCalculate}
            isLoading={isLoading}
          />

          {isLoading && (
            <div className="flex flex-col justify-center items-center p-8 gap-4">
              <Spinner />
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
              <p className="font-bold">{t('error.title')}</p>
              <p>{error}</p>
            </div>
          )}

          {calculationResult && !isLoading && (
            <div className="animate-fade-in space-y-8">
              <SalaryBreakdownDisplay 
                result={calculationResult} 
                hypothesis={hypothesis} 
                setHypothesis={setHypothesis} 
              />

              <section className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-6">
                  {t('references.title')}
                </h2>
                <ul className="space-y-4">
                  {references.map((ref, index) => (
                    <li key={index} className="bg-slate-900/50 p-4 rounded-lg">
                      <a 
                        href={ref.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold text-lg group"
                      >
                        {ref.title}
                        <ExternalLinkIcon className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                      </a>
                      <p className="text-slate-400 mt-1 text-sm">{ref.description}</p>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}
        </main>
        
        <footer className="text-center mt-12 text-slate-500 text-sm">
            <p>
                {t('app.footer.disclaimer')}
            </p>
            <p className="mt-2">{t('app.footer.tech')}</p>
        </footer>
      </div>
    </div>
  );
};

export default App;