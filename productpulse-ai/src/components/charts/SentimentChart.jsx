import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

/** Matches Badge's sentiment tone colors so the same value always reads the same way across the app. */
const SENTIMENT_COLORS = {
  Positive: '#10b981',
  Neutral: '#a1a1aa',
  Negative: '#ef4444',
}

/** @param {{ sentiment: 'Positive'|'Neutral'|'Negative', count: number }[]} data */
export function SentimentChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="sentiment" innerRadius={60} outerRadius={90} paddingAngle={2}>
          {data.map((entry) => (
            <Cell key={entry.sentiment} fill={SENTIMENT_COLORS[entry.sentiment]} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--surface-card)',
            border: '1px solid var(--surface-border)',
            borderRadius: 10,
            fontSize: 13,
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={32}
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span className="text-small text-secondary">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
