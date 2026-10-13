"use client";

import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { SessionProvider, useSession } from "next-auth/react";
import { ReactNode, useEffect, useState } from "react";
import { Toaster } from "sonner";
interface Props {
  children: ReactNode;
}

function SessionQuerySync({ children }: Props) {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const accessToken = (
    session?.user as { accessToken?: string } | undefined
  )?.accessToken;

  useEffect(() => {
    if (status === "authenticated" && accessToken) {
      // Queries mounted before the session resolved must run again with the
      // newly available Authorization token.
      void queryClient.invalidateQueries();
    }

    if (status === "unauthenticated") {
      queryClient.clear();
    }
  }, [accessToken, queryClient, status]);

  return children;
}

const AppProvider = ({ children }: Props) => {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider refetchOnWindowFocus refetchInterval={5 * 60}>
        <SessionQuerySync>{children}</SessionQuerySync>
      </SessionProvider>

      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
};

export default AppProvider;
