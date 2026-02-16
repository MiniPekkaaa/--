import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export function getDayName(dayNum: number): string {
    const days = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
    return days[dayNum] || "";
}

export function getDayNameFull(dayNum: number): string {
    const days = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
    return days[dayNum] || "";
}

export const SOCIAL_COLORS: Record<string, string> = {
    telegram: "#26A5E4",
    instagram: "#E4405F",
    vk: "#0077FF",
    threads: "#000000",
};

export const SOCIAL_GRADIENTS: Record<string, string> = {
    telegram: "from-[#26A5E4] to-[#0088CC]",
    instagram: "from-[#833AB4] via-[#E4405F] to-[#FCAF45]",
    vk: "from-[#0077FF] to-[#0055CC]",
    threads: "from-[#333333] to-[#000000]",
};

export const STATUS_LABELS: Record<string, string> = {
    draft: "Черновик",
    generating: "Генерация...",
    completed: "Готово",
    failed: "Ошибка",
    review: "На проверке",
    approved: "Одобрен",
    published: "Опубликован",
};

export const RUBRIC_COLORS = [
    "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "bg-green-500/20 text-green-400 border-green-500/30",
    "bg-orange-500/20 text-orange-400 border-orange-500/30",
    "bg-red-500/20 text-red-400 border-red-500/30",
    "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    "bg-pink-500/20 text-pink-400 border-pink-500/30",
    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
];
