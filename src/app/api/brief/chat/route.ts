import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { streamChatWithOpenRouter } from "@/lib/ai/openrouter";
import { BRIEF_CHAT_AGENT_PROMPT } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId, message } = await req.json();
        if (!sessionId || !message) {
            return NextResponse.json({ error: "Missing sessionId or message" }, { status: 400 });
        }

        // Save user message
        await db.briefMessage.create({
            data: { sessionId, role: "user", content: message },
        });

        // Get conversation history
        const history = await db.briefMessage.findMany({
            where: { sessionId },
            orderBy: { createdAt: "asc" },
            take: 50,
        });

        // Get uploaded files info for context
        const files = await db.briefFile.findMany({
            where: { sessionId },
            select: { originalName: true, extractedText: true },
        });

        const filesContext = files.length > 0
            ? `\n\nЗагруженные файлы пользователя:\n${files.map((f, i) =>
                `${i + 1}. "${f.originalName}" — ${f.extractedText ? `текст извлечён (${f.extractedText.length} символов)` : "текст не извлечён"}`
            ).join("\n")}`
            : "";

        // Build messages for AI
        const aiMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
            { role: "system", content: BRIEF_CHAT_AGENT_PROMPT + filesContext },
            ...history.map((m) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
            })),
        ];

        // Stream response
        const encoder = new TextEncoder();
        let fullResponse = "";

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of streamChatWithOpenRouter(aiMessages)) {
                        fullResponse += chunk;
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
                    }

                    // Save assistant response
                    await db.briefMessage.create({
                        data: { sessionId, role: "assistant", content: fullResponse },
                    });

                    controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                    controller.close();
                } catch (error) {
                    console.error("Stream error:", error);
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "AI error" })}\n\n`));
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });
    } catch (error) {
        console.error("Brief chat error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
