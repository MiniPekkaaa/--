"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getUserId(): Promise<string> {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    return session.user.id;
}

export async function getAISettings() {
    const userId = await getUserId();
    return db.aISettings.findUnique({ where: { userId } });
}

export async function updateAISettings(data: {
    defaultProvider?: string;
    defaultModel?: string;
    openaiApiKey?: string;
    anthropicApiKey?: string;
    temperature?: number;
    maxTokens?: number;
}) {
    const userId = await getUserId();

    const settings = await db.aISettings.upsert({
        where: { userId },
        update: data,
        create: { userId, ...data },
    });

    revalidatePath("/settings/ai");
    return settings;
}
