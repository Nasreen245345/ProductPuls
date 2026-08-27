import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const BRAND_600 = '#4f46e5'
const BRAND_300 = '#a5b4fc'

/** @param {{ category: string, count: number }[]} data */
export function CategoryChart({ data }) {
  const sorted = [...data].sort((a, b) => b.count - a.count)

  return (
    <ResponsiveContainer width="100%" height={Math.max(240, sorted.length * 32)}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--surface-border)" />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="category"
          width={110}
          tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: 'var(--surface-sunken)' }}
          contentStyle={{
            backgroundColor: 'var(--surface-card)',
            border: '1px solid var(--surface-border)',
            borderRadius: 10,
            fontSize: 13,
          }}
        />
        <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={18}>
          {sorted.map((entry, index) => (
            <Cell key={entry.category} fill={index === 0 ? BRAND_600 : BRAND_300} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
