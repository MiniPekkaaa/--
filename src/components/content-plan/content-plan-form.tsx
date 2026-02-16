"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, CalendarDays, MessageSquare } from "lucide-react";
import { createContentPlan, generateContentPlanPosts } from "@/actions/content-plan";
import { SocialNetworkPicker } from "@/components/content-plan/social-network-picker";
import { RubricsSelector } from "@/components/content-plan/rubrics-selector";
import { FrequencyPicker } from "@/components/content-plan/frequency-picker";
import { AIModelSelector } from "@/components/content-plan/ai-model-selector";
import type { SocialNetwork, RubricData, AIProvider as AIProviderType } from "@/types";

interface ContentPlanFormProps {
    socialNetworks: SocialNetwork[];
    rubrics: RubricData[];
}

export function ContentPlanForm({ socialNetworks, rubrics }: ContentPlanFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [selectedNetworks, setSelectedNetworks] = useState<number[]>([]);
    const [selectedRubrics, setSelectedRubrics] = useState<string[]>(
        rubrics.filter((r) => r.isActive).map((r) => r.id)
    );
    const [postsPerWeek, setPostsPerWeek] = useState(5);
    const [publishDays, setPublishDays] = useState<number[]>([1, 2, 4, 5, 6]);
    const [startDate, setStartDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [wishes, setWishes] = useState("");
    const [aiProvider, setAIProvider] = useState<AIProviderType>("openai");
    const [aiModel, setAIModel] = useState("gpt-5.2");

    const handleSubmit = async () => {
        if (selectedNetworks.length === 0) {
            toast.error("Выберите хотя бы одну соцсеть");
            return;
        }
        if (selectedRubrics.length === 0) {
            toast.error("Выберите хотя бы одну рубрику");
            return;
        }
        if (publishDays.length !== postsPerWeek) {
            toast.error(`Выберите ровно ${postsPerWeek} дней для публикации`);
            return;
        }

        startTransition(async () => {
            try {
                const plan = await createContentPlan({
                    socialNetworkIds: selectedNetworks,
                    rubricIds: selectedRubrics,
                    postsPerWeek,
                    publishDays,
                    startDate: new Date(startDate),
                    wishes,
                    aiProvider,
                    aiModel,
                });

                toast.success("Контент-план создан! Генерация постов...");

                const result = await generateContentPlanPosts(plan.id);
                toast.success(`Создано ${result.postsCount} постов!`);

                router.push("/calendar");
                router.refresh();
            } catch {
                toast.error("Ошибка при создании контент-плана");
            }
        });
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            {/* Social Networks */}
            <section className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-sm">📱</span>
                    Социальные сети
                </h2>
                <SocialNetworkPicker
                    networks={socialNetworks}
                    selected={selectedNetworks}
                    onChange={setSelectedNetworks}
                />
            </section>

            {/* Rubrics */}
            <section className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-sm">📋</span>
                        Ключевые рубрики
                    </h2>
                    <a
                        href="/content-plan/rubrics"
                        className="text-sm text-primary hover:text-primary-hover transition-colors cursor-pointer"
                    >
                        Настроить рубрики →
                    </a>
                </div>
                <RubricsSelector
                    rubrics={rubrics}
                    selected={selectedRubrics}
                    onChange={setSelectedRubrics}
                />
            </section>

            {/* Frequency */}
            <section className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    Частота публикаций
                </h2>
                <FrequencyPicker
                    postsPerWeek={postsPerWeek}
                    publishDays={publishDays}
                    onPostsPerWeekChange={setPostsPerWeek}
                    onPublishDaysChange={setPublishDays}
                />
            </section>

            {/* Start Date */}
            <section className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    Желаемая дата начала
                </h2>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full max-w-xs rounded-lg border border-border bg-surface px-4 py-2.5 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
            </section>

            {/* AI Model */}
            <section className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Модель
                </h2>
                <AIModelSelector
                    provider={aiProvider}
                    model={aiModel}
                    onProviderChange={setAIProvider}
                    onModelChange={setAIModel}
                />
            </section>

            {/* Wishes */}
            <section className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Пожелания к контент-плану
                </h2>
                <textarea
                    value={wishes}
                    onChange={(e) => setWishes(e.target.value)}
                    placeholder="Хочу контент-план по теме анализа своих достижений, с акцентом на мотивацию..."
                    rows={4}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder-muted transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
            </section>

            {/* Submit */}
            <button
                onClick={handleSubmit}
                disabled={isPending}
                className="w-full cursor-pointer rounded-xl bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
            >
                {isPending ? (
                    <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Генерация...
                    </>
                ) : (
                    <>
                        <Sparkles className="h-5 w-5" />
                        Сгенерировать контент-план
                    </>
                )}
            </button>
        </div>
    );
}
