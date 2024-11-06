"use client";
import { SessionProvider } from "next-auth/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import React from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ChatPanelContextProvider } from "@/context/ChatPanelContext";
const queryClient = new QueryClient();

export const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <ChatPanelContextProvider>{children}</ChatPanelContextProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </SessionProvider>
    </>
  );
};
