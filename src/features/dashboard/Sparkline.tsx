import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/formatCurrency';

export function Sparkline({ data }: { data: number[] }) {
  const points = data.map((value, index) => ({ index, value }));

  return (
    <ResponsiveContainer width="100%" height={64}>
      <AreaChart data={points} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="sparklineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity={0.5} />
            <stop offset="100%" stopColor="white" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          labelFormatter={() => ''}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="white"
          strokeWidth={2}
          fill="url(#sparklineFill)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
