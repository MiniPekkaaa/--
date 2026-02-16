"use client";

import { useState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { Bot, Eye, EyeOff } from "lucide-react";
import { getAISettings, updateAISettings } from "@/actions/settings";
import { AI_MODELS } from "@/types";

export default function AISettingsPage() {
    const [provider, setProvider] = useState("openai");
    const [model, setModel] = useState("gpt-5.2");
    const [openaiKey, setOpenaiKey] = useState("");
    const [anthropicKey, setAnthropicKey] = useState("");
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(4096);
    const [showOpenai, setShowOpenai] = useState(false);
    const [showAnthropic, setShowAnthropic] = useState(false);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        (async () => {
            const settings = await getAISettings();
            if (settings) {
                setProvider(settings.defaultProvider);
                setModel(settings.defaultModel);
                setOpenaiKey(settings.openaiApiKey || "");
                setAnthropicKey(settings.anthropicApiKey || "");
                setTemperature(settings.temperature);
                setMaxTokens(settings.maxTokens);
            }
        })();
    }, []);

    const handleSave = () => {
        startTransition(async () => {
            await updateAISettings({
                defaultProvider: provider,
                defaultModel: model,
                openaiApiKey: openaiKey || undefined,
                anthropicApiKey: anthropicKey || undefined,
                temperature,
                maxTokens,
            });
            toast.success("AI настройки сохранены");
        });
    };

    const filteredModels = AI_MODELS.filter((m) => m.provider === provider);

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">AI Настройки</h1>
                <p className="mt-1 text-muted-foreground">Настройте AI провайдеры и модели</p>
            </div>

            {/* API Keys */}
            <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                    <Bot className="h-5 w-5 text-primary" />
                    API Ключи
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                            OpenAI API Key
                        </label>
                        <div className="relative">
                            <input
                                type={showOpenai ? "text" : "password"}
                                value={openaiKey}
                                onChange={(e) => setOpenaiKey(e.target.value)}
                                placeholder="sk-..."
                                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 pr-10 text-sm text-foreground focus:border-primary focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowOpenai(!showOpenai)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                                {showOpenai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                            Anthropic API Key
                        </label>
                        <div className="relative">
                            <input
                                type={showAnthropic ? "text" : "password"}
                                value={anthropicKey}
                                onChange={(e) => setAnthropicKey(e.target.value)}
                                placeholder="sk-ant-..."
                                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 pr-10 text-sm text-foreground focus:border-primary focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowAnthropic(!showAnthropic)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                                {showAnthropic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Default Model */}
            <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Модель по умолчанию</h2>

                <div className="space-y-4">
                    <div className="flex gap-2">
                        {["openai", "anthropic"].map((p) => (
                            <button
                                key={p}
                                onClick={() => {
                                    setProvider(p);
                                    const first = AI_MODELS.find((m) => m.provider === p);
                                    if (first) setModel(first.id);
                                }}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${provider === p
                                        ? "bg-primary/10 text-primary"
                                        : "border border-border text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {p === "openai" ? "OpenAI" : "Anthropic"}
                            </button>
                        ))}
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        {filteredModels.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setModel(m.id)}
                                className={`rounded-lg border p-3 text-left transition-colors cursor-pointer ${model === m.id
                                        ? "border-primary/40 bg-primary/5"
                                        : "border-border hover:bg-surface-hover"
                                    }`}
                            >
                                <div className="text-sm font-medium text-foreground">{m.name}</div>
                                <div className="text-xs text-muted-foreground">{m.description}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Parameters */}
            <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Параметры</h2>
                <div className="space-y-4">
                    <div>
                        <label className="mb-1.5 flex items-center justify-between text-sm text-muted-foreground">
                            <span>Температура</span>
                            <span className="font-mono text-foreground">{temperature}</span>
                        </label>
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.1}
                            value={temperature}
                            onChange={(e) => setTemperature(Number(e.target.value))}
                            className="w-full accent-primary cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-muted">
                            <span>Точно</span>
                            <span>Креативно</span>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm text-muted-foreground">Макс. токенов</label>
                        <select
                            value={maxTokens}
                            onChange={(e) => setMaxTokens(Number(e.target.value))}
                            className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none cursor-pointer"
                        >
                            <option value={2048}>2048</option>
                            <option value={4096}>4096</option>
                            <option value={8192}>8192</option>
                            <option value={16384}>16384</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Save */}
            <button
                onClick={handleSave}
                disabled={isPending}
                className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60 cursor-pointer"
            >
                {isPending ? "Сохранение..." : "Сохранить настройки"}
            </button>
        </div>
    );
}
