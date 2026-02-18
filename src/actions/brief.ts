"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getOrCreateBriefSession() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Find active session or create new one
    let briefSession = await db.briefSession.findFirst({
        where: { userId: session.user.id, status: "active" },
        include: {
            messages: { orderBy: { createdAt: "asc" } },
            files: { orderBy: { createdAt: "asc" } },
        },
    });

    if (!briefSession) {
        briefSession = await db.briefSession.create({
            data: { userId: session.user.id },
            include: {
                messages: { orderBy: { createdAt: "asc" } },
                files: { orderBy: { createdAt: "asc" } },
            },
        });
    }

    return briefSession;
}

export async function getBriefSession(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    return db.briefSession.findFirst({
        where: { id, userId: session.user.id },
        include: {
            messages: { orderBy: { createdAt: "asc" } },
            files: { orderBy: { createdAt: "asc" } },
        },
    });
}

export async function saveBriefMessage(sessionId: string, role: "user" | "assistant", content: string) {
    return db.briefMessage.create({
        data: { sessionId, role, content },
    });
}

export async function completeBriefSession(id: string, briefText: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    return db.briefSession.update({
        where: { id, userId: session.user.id },
        data: { status: "completed", briefText },
    });
}

export async function startNewBriefSession() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Mark all active sessions as completed
    await db.briefSession.updateMany({
        where: { userId: session.user.id, status: "active" },
        data: { status: "completed" },
    });

    // Create new one
    return db.briefSession.create({
        data: { userId: session.user.id },
        include: {
            messages: { orderBy: { createdAt: "asc" } },
            files: { orderBy: { createdAt: "asc" } },
        },
    });
}

export async function getSessionFiles(sessionId: string) {
    return db.briefFile.findMany({
        where: { sessionId },
        orderBy: { createdAt: "asc" },
        select: {
            id: true,
            originalName: true,
            mimeType: true,
            fileSize: true,
            extractedText: true,
            createdAt: true,
        },
    });
}
