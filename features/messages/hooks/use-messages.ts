"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listMessages,
  createMessage,
  updateMessage,
  deleteMessage,
} from "../actions/messages-action";
import { queryKeys } from "@/features/conversation/utils/query-keys";

export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys().messages.byConversation(conversationId ?? "none"),
    queryFn: () => listMessages(conversationId!),
    enabled: Boolean(conversationId),
  });
}

export function useCreateMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => createMessage(conversationId, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys().messages.byConversation(conversationId),
      });

      void queryClient.invalidateQueries({
        queryKey: queryKeys().conversations.all,
      });
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });
}

export function useUpdateMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => {
      return updateMessage(id, content);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys().messages.byConversation(conversationId),
      });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update message");
      }
    },
  });
}

export function useDeleteMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => deleteMessage(messageId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys().messages.byConversation(conversationId),
      });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete message");
      }
    },
  });
}
