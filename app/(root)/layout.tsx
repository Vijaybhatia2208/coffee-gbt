import { onBoard } from "@/features/auth/action/onboard";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import { ChatShell } from "@/features/conversation/components/chat-sheel";

const RootGroupLayout = async ({ children }: { children: React.ReactNode }) => {
  await auth.protect();
  await onBoard();
  return (
    <ChatShell>
      <div>{children}</div>
    </ChatShell>
  );
};

export default RootGroupLayout;
