import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Language } from '../types';

interface LanguageOption {
  code: Language;
  name: string;
}

const languages: LanguageOption[] = [
  { code: 'es', name: 'Español' },
  { code: 'ca', name: 'Català' },
  { code: 'eu', name: 'Euskara' },
  { code: 'gl', name: 'Galego' },
  { code: 'oc', name: 'Aranés' },
];


const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <div className="relative">
      <select
        value={language}
        onChange={handleLanguageChange}
        className="text-lg bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors appearance-none py-2 pl-4 pr-10 bg-no-repeat bg-right-3"
        aria-label="Seleccionar idioma"
        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundSize: '1.2em 1.2em' }}
      >
        {languages.map(({ code, name }) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;