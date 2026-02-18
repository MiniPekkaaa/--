import OpenAI from "openai";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

function getOpenRouterClient() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

    return new OpenAI({
        apiKey,
        baseURL: OPENROUTER_BASE_URL,
        defaultHeaders: {
            "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
            "X-Title": "Content Machine",
        },
    });
}

export async function chatWithOpenRouter(
    messages: { role: "system" | "user" | "assistant"; content: string }[],
    model: string = "openai/gpt-5.2"
): Promise<string> {
    const client = getOpenRouterClient();

    const response = await client.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 4096,
    });

    return response.choices[0]?.message?.content || "";
}

export async function* streamChatWithOpenRouter(
    messages: { role: "system" | "user" | "assistant"; content: string }[],
    model: string = "openai/gpt-5.2"
): AsyncGenerator<string> {
    const client = getOpenRouterClient();

    const stream = await client.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 4096,
        stream: true,
    });

    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) yield content;
    }
}
