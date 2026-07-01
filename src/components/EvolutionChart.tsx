import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface EvolutionChartProps {
  data: { geracao: number; melhorDistancia: number }[];
}

export function EvolutionChart({ data }: EvolutionChartProps) {
  return (
    <div className="w-full h-full min-h-[300px] bg-slate-900 rounded-lg p-4 border border-slate-800 shadow-inner">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="geracao" 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            tickMargin={10}
            axisLine={false}
          />
          <YAxis 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) =>
              typeof value === 'number' ? value.toFixed(0) : String(value)
            }
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
            itemStyle={{ color: '#818cf8' }}
            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
            formatter={(value) => [
              typeof value === 'number' ? value.toFixed(2) : String(value),
              'Distância',
            ]}
            labelFormatter={(label) => `Geração: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="melhorDistancia"
            stroke="#818cf8"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#ec4899', stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive={false} // Disable animation to improve performance during live updates
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
