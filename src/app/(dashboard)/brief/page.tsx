import { getOrCreateBriefSession } from "@/actions/brief";
import { BriefChat } from "@/components/brief/brief-chat";

export default async function BriefPage() {
    const session = await getOrCreateBriefSession();
    const welcomeMessage = process.env.BRIEF_WELCOME_MESSAGE ||
        "Здравствуйте! 👋 Я помогу вам создать бриф для контент-стратегии. Пришлите мне информацию о вашем проекте — это может быть текст, документ (Word, PDF, Excel) или любой другой материал. Я проанализирую данные и составлю структурированный бриф.";

    return (
        <BriefChat
            sessionId={session.id}
            initialMessages={session.messages.map((m) => ({
                id: m.id,
                role: m.role as "user" | "assistant",
                content: m.content,
                createdAt: m.createdAt.toISOString(),
            }))}
            initialFiles={session.files.map((f) => ({
                id: f.id,
                originalName: f.originalName,
                mimeType: f.mimeType,
                fileSize: f.fileSize,
                extractedText: f.extractedText,
                createdAt: f.createdAt.toISOString(),
            }))}
            welcomeMessage={welcomeMessage}
        />
    );
}
