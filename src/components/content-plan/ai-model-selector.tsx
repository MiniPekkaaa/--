"use client";

import { cn } from "@/lib/utils";
import { AI_MODELS, type AIProvider } from "@/types";

interface AIModelSelectorProps {
    provider: AIProvider;
    model: string;
    onProviderChange: (provider: AIProvider) => void;
    onModelChange: (model: string) => void;
}

export function AIModelSelector({
    provider,
    model,
    onProviderChange,
    onModelChange,
}: AIModelSelectorProps) {
    const providers: { value: AIProvider; label: string; color: string }[] = [
        { value: "openai", label: "OpenAI", color: "bg-green-500/20 text-green-400 border-green-500/30" },
        { value: "anthropic", label: "Anthropic", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
    ];

    const filteredModels = AI_MODELS.filter((m) => m.provider === provider);

    return (
        <div className="space-y-4">
            {/* Provider toggle */}
            <div className="flex gap-2">
                {providers.map((p) => (
                    <button
                        key={p.value}
                        onClick={() => {
                            onProviderChange(p.value);
                            const firstModel = AI_MODELS.find((m) => m.provider === p.value);
                            if (firstModel) onModelChange(firstModel.id);
                        }}
                        className={cn(
                            "cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                            provider === p.value
                                ? p.color
                                : "border-border bg-surface text-muted-foreground hover:bg-surface-hover"
                        )}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Model select */}
            <div className="grid gap-2 sm:grid-cols-2">
                {filteredModels.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => onModelChange(m.id)}
                        className={cn(
                            "cursor-pointer rounded-lg border p-3 text-left transition-all",
                            model === m.id
                                ? "border-primary/40 bg-primary/5"
                                : "border-border bg-surface hover:bg-surface-hover"
                        )}
                    >
                        <div className="text-sm font-medium text-foreground">{m.name}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{m.description}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}
