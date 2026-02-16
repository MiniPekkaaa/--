"use client";

import { cn } from "@/lib/utils";
import { DAYS_OF_WEEK } from "@/types";

interface FrequencyPickerProps {
    postsPerWeek: number;
    publishDays: number[];
    onPostsPerWeekChange: (n: number) => void;
    onPublishDaysChange: (days: number[]) => void;
}

export function FrequencyPicker({
    postsPerWeek,
    publishDays,
    onPostsPerWeekChange,
    onPublishDaysChange,
}: FrequencyPickerProps) {
    const handlePostsChange = (value: number) => {
        onPostsPerWeekChange(value);
        // Reset days if count changed
        if (publishDays.length > value) {
            onPublishDaysChange(publishDays.slice(0, value));
        }
    };

    const toggleDay = (day: number) => {
        if (publishDays.includes(day)) {
            onPublishDaysChange(publishDays.filter((d) => d !== day));
        } else if (publishDays.length < postsPerWeek) {
            onPublishDaysChange([...publishDays, day]);
        }
    };

    return (
        <div className="space-y-5">
            {/* Posts per week */}
            <div>
                <label className="mb-2 block text-sm text-muted-foreground">
                    Постов в неделю
                </label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                        <button
                            key={n}
                            onClick={() => handlePostsChange(n)}
                            className={cn(
                                "flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-sm font-medium transition-all",
                                postsPerWeek === n
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "border border-border bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                            )}
                        >
                            {n}
                        </button>
                    ))}
                </div>
            </div>

            {/* Days of week */}
            <div>
                <label className="mb-2 block text-sm text-muted-foreground">
                    Дни публикаций
                    <span className="ml-2 text-xs">
                        ({publishDays.length}/{postsPerWeek} выбрано)
                    </span>
                </label>
                <div className="flex gap-2">
                    {DAYS_OF_WEEK.map(({ value, label, full }) => {
                        const isSelected = publishDays.includes(value);
                        const isDisabled = !isSelected && publishDays.length >= postsPerWeek;

                        return (
                            <button
                                key={value}
                                onClick={() => toggleDay(value)}
                                disabled={isDisabled}
                                title={full}
                                className={cn(
                                    "flex h-12 w-12 cursor-pointer flex-col items-center justify-center rounded-lg text-xs font-medium transition-all",
                                    isSelected
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : isDisabled
                                            ? "border border-border/50 bg-surface/50 text-muted cursor-not-allowed"
                                            : "border border-border bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                                )}
                            >
                                <span className="text-sm font-bold">{label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
