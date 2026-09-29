import { Suspense } from "react";
import ShowUserList from "./_components/ShowUserList";

export default function UserManagementPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-[#BFA98A]">Loading consumers & users...</div>}>
      <ShowUserList />
    </Suspense>
  );
}
