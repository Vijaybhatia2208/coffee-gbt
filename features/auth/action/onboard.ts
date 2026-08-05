"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import type { User } from "@/lib/generated/prisma/client";

export async function onBoard() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("No user");
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? null;
  const existingUser = await prisma.user.findFirst({
    where: {
      clerkId: clerkUser.id,
    },
  });

  return prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    create: {
      clerkId: clerkUser.id,
      email: email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    },
    update: {
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      email: email,
    },
  });
}
