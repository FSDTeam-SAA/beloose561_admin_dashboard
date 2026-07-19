import React from 'react'
import OverviewStates from './_components/OverviewStates'
import RetailerGrowthChart from './_components/RetailerGrowthChart'
import LastActivity from './_components/LastActivity'

function page() {
  return (
    <div>
      <OverviewStates />
      <RetailerGrowthChart />
      <LastActivity />
    </div>
  )
}

export default page