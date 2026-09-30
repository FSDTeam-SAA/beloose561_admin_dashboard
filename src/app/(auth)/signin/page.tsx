import React, { Suspense } from "react";
import LoginForm from "./_components/SignInPage";

function page() {
  return (
    <div>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

export default page;
