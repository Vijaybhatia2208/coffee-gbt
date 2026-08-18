"use server";

import { requireUser } from "@/features/auth/action/require-user";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type ConversationListItem = {
  id: string;
  title: string;
  isPinned: boolean;
  isArchived: boolean;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export async function assertOwnsConversation(
  conversationId: string,
  userId: string,
) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  return conversation;
}

export async function getConversation(conversationId: string) {
  const user = await requireUser();
  return await assertOwnsConversation(conversationId, user.id);
}

export async function listConversation(): Promise<ConversationListItem[]> {
  try {
    const user = await requireUser();

    return prisma.conversation.findMany({
      where: { userId: user.id, isArchived: false },
      orderBy: [{ isPinned: "desc" }, { lastMessageAt: "desc" }],
      select: {
        id: true,
        title: true,
        isPinned: true,
        isArchived: true,
        lastMessageAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    return [];
  }
}

export async function createConveration(title = "New Chat") {
  try {
    const user = await requireUser();

    return prisma.conversation.create({
      data: {
        title: title,
        userId: user.id,
      },
    });
  } catch (error) {}
}

export async function updateConversation(
  conversationId: string,
  data: { title?: string; isPinned?: boolean; isArchived?: boolean },
) {
  const user = await requireUser();

  await assertOwnsConversation(conversationId, user.id);

  const converstion = prisma.conversation.update({
    where: { id: conversationId },
    data: {
      ...(data.title !== undefined
        ? {
            title: data.title.trim(),
          }
        : {}),
      ...(data.isPinned !== undefined ? { isPinned: data.isPinned } : {}),
      ...(data.isArchived !== undefined ? { isArchived: data.isArchived } : {}),
    },
  });

  revalidatePath("/");
  revalidatePath(`/c/${conversationId}`);
  return converstion;
}

export async function deleteConveration(conversationId: string) {
  try {
    const user = await requireUser();
    await assertOwnsConversation(conversationId, user.id);
    await prisma.conversation.delete({
      where: { id: conversationId },
    });

    revalidatePath("/");
  } catch (error) {}
}
