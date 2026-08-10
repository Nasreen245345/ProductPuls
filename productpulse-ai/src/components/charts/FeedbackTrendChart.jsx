import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const BRAND_600 = '#4f46e5'

/** @param {{ date: string, count: number }[]} data */
export function FeedbackTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="feedbackTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={BRAND_600} stopOpacity={0.25} />
            <stop offset="95%" stopColor={BRAND_600} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border)" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--surface-card)',
            border: '1px solid var(--surface-border)',
            borderRadius: 10,
            fontSize: 13,
          }}
          labelFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        />
        <Area type="monotone" dataKey="count" name="Feedback" stroke={BRAND_600} strokeWidth={2} fill="url(#feedbackTrendFill)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
