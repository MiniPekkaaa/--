import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider } from "@/types";

export interface AIProviderClient {
    generateStream(prompt: string, model: string): AsyncGenerator<string>;
}

export function createOpenAIClient(apiKey: string): AIProviderClient {
    const client = new OpenAI({ apiKey });

    return {
        async *generateStream(prompt: string, model: string) {
            const stream = await client.chat.completions.create({
                model,
                messages: [{ role: "user", content: prompt }],
                stream: true,
                temperature: 0.7,
                max_tokens: 8192,
            });

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) yield content;
            }
        },
    };
}

export function createAnthropicClient(apiKey: string): AIProviderClient {
    const client = new Anthropic({ apiKey });

    return {
        async *generateStream(prompt: string, model: string) {
            const stream = client.messages.stream({
                model,
                max_tokens: 8192,
                messages: [{ role: "user", content: prompt }],
            });

            for await (const event of stream) {
                if (
                    event.type === "content_block_delta" &&
                    event.delta.type === "text_delta"
                ) {
                    yield event.delta.text;
                }
            }
        },
    };
}

export function createAIClient(
    provider: AIProvider,
    apiKey: string
): AIProviderClient {
    switch (provider) {
        case "openai":
            return createOpenAIClient(apiKey);
        case "anthropic":
            return createAnthropicClient(apiKey);
        default:
            throw new Error(`Unknown AI provider: ${provider}`);
    }
}
