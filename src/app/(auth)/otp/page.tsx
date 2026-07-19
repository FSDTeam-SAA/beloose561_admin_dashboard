import React, { Suspense } from 'react'
import VerifyEmailPage from './_components/VerifyEmailPage'

function page() {
  return (
    <div>
      <Suspense fallback={null}><VerifyEmailPage /></Suspense>
    </div>
  )
}

export default page
