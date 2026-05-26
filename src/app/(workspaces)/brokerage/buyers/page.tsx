import BuyerMatchingHeader from '@/components/brokerage/BuyerMatchingHeader'
import ActiveListings from '@/components/brokerage/ActiveListings'
import BuyerProfiles from '@/components/brokerage/BuyerProfiles'
import MatchRecommendations from '@/components/brokerage/MatchRecommendations'
import OutreachTracker from '@/components/brokerage/OutreachTracker'
import AgentMatchInsights from '@/components/brokerage/AgentMatchInsights'

export default function BuyerMatchingPage() {
  return (
    <div className="min-h-screen bg-white">
      <BuyerMatchingHeader />
      
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Active Listings Overview */}
        <ActiveListings />

        {/* Match Recommendations */}
        <MatchRecommendations />

        {/* Buyer Profiles */}
        <BuyerProfiles />

        {/* Outreach Tracker */}
        <OutreachTracker />

        {/* Agent Match Insights */}
        <AgentMatchInsights />
      </div>
    </div>
  )
}
