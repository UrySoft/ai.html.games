
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, PieLabelRenderProps } from 'recharts';
import { SalaryBreakdown } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface SalaryPieChartProps {
  breakdown: SalaryBreakdown;
  period: 'annual' | 'monthly';
}

const COLORS = {
  net: '#10b981', // Net (Green)
  state: '#3b82f6', // State (Blue)
  community: '#f97316', // Community (Orange)
};


const formatCurrency = (value: number) => {
  return value.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true,
  });
};


const SalaryPieChart: React.FC<SalaryPieChartProps> = ({ breakdown, period }) => {
  const { t } = useTranslation();
  const divisor = period === 'annual' ? 1 : 12;

  const centralStateContribution =
    breakdown.employerSocialSecurityAnnual +
    breakdown.employeeSocialSecurityAnnual +
    breakdown.irpfStateAnnual;
  
  const communityContribution = breakdown.irpfCommunityAnnual;
  
  const renderCustomizedLabel = (props: PieLabelRenderProps) => {
    const { cx, cy, midAngle, outerRadius, percent, payload } = props;

    if (
      typeof cx !== 'number' || typeof cy !== 'number' || typeof midAngle !== 'number' ||
      typeof outerRadius !== 'number' || typeof percent !== 'number' || !payload
    ) {
      return null;
    }

    const radius = outerRadius * 1.25; 
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const anchor = x > cx ? 'start' : 'end';
    
    const payloadData = payload as { name: string; value: number; color: string };

    return (
      <g>
        <text x={x} y={y} textAnchor={anchor} fill={payloadData.color} dominantBaseline="central">
          <tspan x={x} dy="-1.2em" className="text-sm font-bold">{payloadData.name}</tspan>
          <tspan x={x} dy="1.2em" className="text-lg font-semibold">{formatCurrency(payloadData.value)}</tspan>
          <tspan x={x} dy="1.4em" className="text-base fill-slate-300">{`(${(percent * 100).toFixed(1)}%)`}</tspan>
        </text>
      </g>
    );
  };
  
  const RADIAN = Math.PI / 180;

  const data = [
    { name: t('pieChart.net'), value: breakdown.netAnnual / divisor, color: COLORS.net },
    { name: t('pieChart.state'), value: centralStateContribution / divisor, color: COLORS.state },
    { name: t('pieChart.community'), value: communityContribution / divisor, color: COLORS.community },
  ].filter(d => d.value > 0);

  return (
    <div className="bg-slate-800 p-4 sm:p-6 rounded-xl border border-slate-700 h-full flex flex-col justify-center items-center shadow-lg">
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <PieChart margin={{ top: 60, right: 60, bottom: 60, left: 60 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              nameKey="name"
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalaryPieChart;