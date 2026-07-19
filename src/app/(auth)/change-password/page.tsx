import React, { Suspense } from 'react'
import ChangePasswordPage from './_components/ChangePassword'

function page() {
  return (
    <div>
      <Suspense fallback={null}><ChangePasswordPage /></Suspense>
    </div>
  )
}

export default page
