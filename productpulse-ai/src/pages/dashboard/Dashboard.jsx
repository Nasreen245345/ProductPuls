import { Package, MessageSquareText, Lightbulb, AlertTriangle } from 'lucide-react'
import { useDashboard } from '../../hooks/useDashboard'
import { useAuth } from '../../hooks/useAuth'
import { StatsCard } from '../../components/cards/StatsCard'
import { InsightCard } from '../../components/cards/InsightCard'
import { FeedbackTrendChart } from '../../components/charts/FeedbackTrendChart'
import { SentimentChart } from '../../components/charts/SentimentChart'
import { CategoryChart } from '../../components/charts/CategoryChart'
import { FeatureRequestChart } from '../../components/charts/FeatureRequestChart'
import { FeedbackTable } from '../../components/tables/FeedbackTable'
import { Card } from '../../components/ui/Card'
import { SkeletonCard, SkeletonTable, Skeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

/** Computes a same-vs-previous-day trend from the feedback_over_time series — derived, not fabricated. */
function computeFeedbackTrend(series) {
  if (!series || series.length < 2) return undefined
  const latest = series[series.length - 1].count
  const previous = series[series.length - 2].count
  const delta = latest - previous
  if (delta === 0) return { direction: 'up', label: 'Flat vs. yesterday' }
  return {
    direction: delta > 0 ? 'up' : 'down',
    label: `${delta > 0 ? '+' : ''}${delta} vs. yesterday`,
  }
}

export function Dashboard() {
  const { user } = useAuth()
  const { data, isLoading, error } = useDashboard()

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Couldn't load the dashboard"
        description={error.message || 'Something went wrong fetching your dashboard data. Please try again.'}
      />
    )
  }

  return (
    <div>
      {/* Welcome banner */}
      <div className="mb-6">
        <h1 className="text-page-heading text-primary">
          {getGreeting()}
          {user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-body mt-1 text-secondary">{today}</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatsCard icon={Package} label="Total Products" value={data.overview.total_products} />
            <StatsCard
              icon={MessageSquareText}
              label="Total Feedback"
              value={data.overview.total_feedback}
              trend={computeFeedbackTrend(data.charts.feedback_over_time)}
            />
            <StatsCard icon={Lightbulb} label="Feature Requests" value={data.overview.total_feature_requests} />
            <StatsCard icon={AlertTriangle} label="Pain Points" value={data.overview.total_pain_points} />
          </>
        )}
      </div>

      {/* Charts + AI insights */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-card-heading text-primary">Feedback over time</h3>
          {isLoading ? <Skeleton className="mt-4 h-60 w-full" /> : <FeedbackTrendChart data={data.charts.feedback_over_time} />}
        </Card>

        {isLoading ? (
          <SkeletonCard />
        ) : (
          <InsightCard
            summary={data.insights.ai_summary}
            painPoints={data.insights.top_pain_points}
            featureRequests={data.insights.top_feature_requests}
          />
        )}

        <Card className="p-5">
          <h3 className="text-card-heading text-primary">Sentiment distribution</h3>
          {isLoading ? <Skeleton className="mt-4 h-60 w-full" /> : <SentimentChart data={data.charts.sentiment_distribution} />}
        </Card>

        <Card className="p-5">
          <h3 className="text-card-heading text-primary">Category breakdown</h3>
          {isLoading ? <Skeleton className="mt-4 h-60 w-full" /> : <CategoryChart data={data.charts.category_breakdown} />}
        </Card>

        <Card className="p-5">
          <h3 className="text-card-heading text-primary">Top feature requests</h3>
          {isLoading ? (
            <Skeleton className="mt-4 h-60 w-full" />
          ) : (
            <FeatureRequestChart data={data.insights.top_feature_requests} />
          )}
        </Card>
      </div>

      {/* Recent feedback */}
      <div className="mt-6">
        <h3 className="text-card-heading mb-3 text-primary">Recent feedback</h3>
        {isLoading ? (
          <SkeletonTable rows={5} columns={4} />
        ) : data.recentFeedback.length > 0 ? (
          <FeedbackTable items={data.recentFeedback} />
        ) : (
          <EmptyState
            icon={MessageSquareText}
            title="No feedback yet"
            description="Feedback will show up here as soon as customers start submitting it."
          />
        )}
      </div>
    </div>
  )
}
