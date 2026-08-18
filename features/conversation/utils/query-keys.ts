export function queryKeys() {
  return {
    conversations: {
      all: ["conversations"] as const,
      detail: (id: string) => ["conversations", id] as const,
    },
    messages: {
      byConversation: (conversationId: string) => {
        return ["messages", conversationId] as const;
      },
    },
  };
}
