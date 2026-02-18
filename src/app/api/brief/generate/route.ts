import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chatWithOpenRouter } from "@/lib/ai/openrouter";
import { buildBriefGenerationPrompt } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId } = await req.json();
        if (!sessionId) {
            return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
        }

        // Verify session
        const briefSession = await db.briefSession.findFirst({
            where: { id: sessionId, userId: session.user.id },
        });
        if (!briefSession) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        // Get all files with extracted text (per file)
        const files = await db.briefFile.findMany({
            where: { sessionId },
            select: { originalName: true, extractedText: true },
        });

        // Also include user's text messages as context
        const userMessages = await db.briefMessage.findMany({
            where: { sessionId, role: "user" },
            select: { content: true, createdAt: true },
            orderBy: { createdAt: "asc" },
        });

        // Build file contents array — each file is separate with its name
        const fileContents: { name: string; text: string }[] = [];

        // Add files
        for (const file of files) {
            if (file.extractedText) {
                fileContents.push({
                    name: file.originalName,
                    text: file.extractedText,
                });
            }
        }

        // Add user text messages as a "file"
        const userTexts = userMessages
            .map((m) => m.content)
            .filter((c) => c.length > 20) // skip short replies
            .join("\n\n");

        if (userTexts.length > 0) {
            fileContents.push({
                name: "Текстовые сообщения пользователя",
                text: userTexts,
            });
        }

        if (fileContents.length === 0) {
            return NextResponse.json(
                { error: "Нет материалов для создания брифа. Загрузите файлы или отправьте текст." },
                { status: 400 }
            );
        }

        // Generate brief
        const prompt = buildBriefGenerationPrompt(fileContents);
        const briefText = await chatWithOpenRouter([
            { role: "user", content: prompt },
        ]);

        // Save brief to session
        await db.briefSession.update({
            where: { id: sessionId },
            data: { status: "completed", briefText },
        });

        // Save as assistant message too
        await db.briefMessage.create({
            data: {
                sessionId,
                role: "assistant",
                content: `📋 **Бриф создан:**\n\n${briefText}`,
            },
        });

        return NextResponse.json({ briefText });
    } catch (error) {
        console.error("Brief generation error:", error);
        return NextResponse.json({ error: "Brief generation failed" }, { status: 500 });
    }
}
