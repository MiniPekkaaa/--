"use client";

import { cn } from "@/lib/utils";
import { RUBRIC_COLORS } from "@/lib/utils";
import type { RubricData } from "@/types";

interface RubricsSelectorProps {
    rubrics: RubricData[];
    selected: string[];
    onChange: (ids: string[]) => void;
}

export function RubricsSelector({ rubrics, selected, onChange }: RubricsSelectorProps) {
    const toggle = (id: string) => {
        onChange(
            selected.includes(id)
                ? selected.filter((s) => s !== id)
                : [...selected, id]
        );
    };

    return (
        <div className="space-y-2">
            {rubrics.map((rubric, i) => {
                const isSelected = selected.includes(rubric.id);
                const colorClass = RUBRIC_COLORS[i % RUBRIC_COLORS.length];

                return (
                    <button
                        key={rubric.id}
                        onClick={() => toggle(rubric.id)}
                        className={cn(
                            "flex w-full cursor-pointer items-center gap-3 rounded-lg border p-3 text-left transition-all duration-150",
                            isSelected
                                ? `border-primary/30 bg-primary/5`
                                : "border-border bg-surface hover:bg-surface-hover"
                        )}
                    >
                        {/* Checkbox */}
                        <div
                            className={cn(
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all",
                                isSelected
                                    ? "border-primary bg-primary"
                                    : "border-border"
                            )}
                        >
                            {isSelected && (
                                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>

                        {/* Color dot */}
                        <div className={cn("h-3 w-3 shrink-0 rounded-full", colorClass.split(" ")[0]?.replace("/20", ""))}
                            style={{ backgroundColor: `oklch(60% 0.2 ${(i * 55 + 265) % 360})` }} />

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <span className={cn("text-sm font-medium", isSelected ? "text-foreground" : "text-muted-foreground")}>
                                    {rubric.name}
                                </span>
                                <span className={cn("rounded-full px-2 py-0.5 text-xs border", colorClass)}>
                                    {rubric.postsPerMonth} постов/мес
                                </span>
                            </div>
                            <p className="mt-0.5 text-xs text-muted truncate">
                                {rubric.description}
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
