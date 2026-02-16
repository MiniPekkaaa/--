"use client";

import { cn } from "@/lib/utils";
import type { SocialNetwork } from "@/types";
import { Icon } from "@iconify/react";

interface SocialNetworkPickerProps {
    networks: SocialNetwork[];
    selected: number[];
    onChange: (ids: number[]) => void;
}

const NETWORK_STYLES: Record<string, { gradient: string; glow: string }> = {
    telegram: {
        gradient: "from-[#26A5E4] to-[#0088CC]",
        glow: "shadow-[#26A5E4]/40",
    },
    instagram: {
        gradient: "from-[#833AB4] via-[#E4405F] to-[#FCAF45]",
        glow: "shadow-[#E4405F]/40",
    },
    vk: {
        gradient: "from-[#0077FF] to-[#0055CC]",
        glow: "shadow-[#0077FF]/40",
    },
    threads: {
        gradient: "from-[#555555] to-[#000000]",
        glow: "shadow-[#666666]/40",
    },
};

export function SocialNetworkPicker({
    networks,
    selected,
    onChange,
}: SocialNetworkPickerProps) {
    const toggle = (id: number) => {
        onChange(
            selected.includes(id)
                ? selected.filter((s) => s !== id)
                : [...selected, id]
        );
    };

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {networks.map((network) => {
                const isSelected = selected.includes(network.id);
                const styles = NETWORK_STYLES[network.slug] || NETWORK_STYLES.telegram;

                return (
                    <button
                        key={network.id}
                        onClick={() => toggle(network.id)}
                        className={cn(
                            "group relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200",
                            isSelected
                                ? `border-transparent bg-gradient-to-br ${styles.gradient} shadow-lg ${styles.glow} scale-[1.02]`
                                : "border-border bg-surface hover:bg-surface-hover hover:border-border-light"
                        )}
                    >
                        <div className="flex flex-col items-center gap-2.5">
                            <Icon
                                icon={network.iconName}
                                className={cn(
                                    "h-8 w-8 transition-all",
                                    isSelected ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                                )}
                            />
                            <span
                                className={cn(
                                    "text-sm font-medium transition-colors",
                                    isSelected ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                                )}
                            >
                                {network.name}
                            </span>
                        </div>

                        {/* Checkmark */}
                        {isSelected && (
                            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md animate-scale-in">
                                <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
