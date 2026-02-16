export type SocialNetworkSlug = "telegram" | "instagram" | "vk" | "threads";

export type ContentPlanStatus = "draft" | "generating" | "completed" | "failed";
export type PostStatus = "draft" | "review" | "approved" | "published";
export type AIProvider = "openai" | "anthropic";

export interface SocialNetwork {
    id: number;
    slug: SocialNetworkSlug;
    name: string;
    color: string;
    iconName: string;
}

export interface RubricData {
    id: string;
    name: string;
    description: string;
    postsPerMonth: number;
    sortOrder: number;
    isActive: boolean;
}

export interface ContentPlanFormData {
    socialNetworkIds: number[];
    rubricIds: string[];
    postsPerWeek: number;
    publishDays: number[];
    startDate: Date;
    wishes: string;
    aiProvider: AIProvider;
    aiModel: string;
}

export interface PostData {
    id: string;
    title: string;
    content: string;
    hashtags: string;
    publishDate: string;
    publishTime: string | null;
    status: PostStatus;
    socialNetwork: SocialNetwork;
    rubric: RubricData | null;
    images: PostImageData[];
    contentPlanId: string;
}

export interface PostImageData {
    id: string;
    url: string;
    altText: string;
    sortOrder: number;
}

export interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    posts: PostData[];
}

export interface AIModelOption {
    id: string;
    name: string;
    provider: AIProvider;
    description: string;
}

export const AI_MODELS: AIModelOption[] = [
    { id: "gpt-5.2", name: "GPT-5.2", provider: "openai", description: "Лучший для контента" },
    { id: "gpt-5.1", name: "GPT-5.1", provider: "openai", description: "Стабильный и быстрый" },
    { id: "gpt-4o", name: "GPT-4o", provider: "openai", description: "Мультимодальный" },
    { id: "o3", name: "o3", provider: "openai", description: "Глубокое рассуждение" },
    { id: "o4-mini", name: "o4-mini", provider: "openai", description: "Бюджетный с рассуждением" },
    { id: "claude-opus-4-6", name: "Claude Opus 4.6", provider: "anthropic", description: "Наилучшее качество" },
    { id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5", provider: "anthropic", description: "Кодинг + контент" },
    { id: "claude-opus-4-5", name: "Claude Opus 4.5", provider: "anthropic", description: "Универсальный" },
    { id: "claude-sonnet-4", name: "Claude Sonnet 4", provider: "anthropic", description: "Базовый" },
];

export const DAYS_OF_WEEK = [
    { value: 1, label: "Пн", full: "Понедельник" },
    { value: 2, label: "Вт", full: "Вторник" },
    { value: 3, label: "Ср", full: "Среда" },
    { value: 4, label: "Чт", full: "Четверг" },
    { value: 5, label: "Пт", full: "Пятница" },
    { value: 6, label: "Сб", full: "Суббота" },
    { value: 0, label: "Вс", full: "Воскресенье" },
];
