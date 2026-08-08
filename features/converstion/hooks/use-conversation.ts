"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createConveration,
  listConversation,
  updateConversation,
  deleteConveration,
} from "../actions/conversation-actions";
import { queryKeys } from "../utils/query-keys";

export function useConversations() {
  return useQuery({
    queryKey: queryKeys().conversations.all,
    queryFn: listConversation,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (title: string) => createConveration(title),
    onSuccess: (conversation: any) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys().conversations.all,
      });

      router.push(`/c/${conversation.id}`);
    },
    onError: (error: Error) => {
      toast.error("Failed to create conversation");
    },
  });
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      title?: string;
      isPinned?: boolean;
      isArchived?: boolean;
    }) => updateConversation(id, data),
    onSuccess: (conversation) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys().conversations.all,
      });

      void queryClient.invalidateQueries({
        queryKey: queryKeys().conversations.detail(conversation.id),
      });
    },
    onError: () => {
      toast.error("Failed to update conversation");
    },
  });
}

export function useDeletConversation(activeId?: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => deleteConveration(id),
    onSuccess: ({ id }: any) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys().conversations.all,
      });

      void queryClient.removeQueries({
        queryKey: queryKeys().messages.byConversation(id),
      });

      if (activeId == id) {
        router.push("/");
      }

      toast.success("Chat Deleted");
    },
    onError: () => {
      toast.error("Failed to update conversation");
    },
  });
}
