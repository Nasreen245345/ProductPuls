import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const AI_600 = '#7c3aed'

/** @param {{ label: string, count?: number, mentions?: number }[]} data */
export function FeatureRequestChart({ data }) {
  // Accepts either `count` (Analytics page shape) or `mentions` (Dashboard insights shape).
  const normalized = data.map((item) => ({ label: item.label, value: item.count ?? item.mentions ?? 0 }))

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, normalized.length * 36)}>
      <BarChart data={normalized} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--surface-border)" />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="label"
          width={150}
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
        <Bar dataKey="value" name="Mentions" fill={AI_600} radius={[0, 6, 6, 0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  )
}
