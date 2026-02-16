"use client";

import { useState, useEffect, useTransition } from "react";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPostsByDateRange } from "@/actions/posts";
import { PostCard } from "@/components/calendar/post-card";
import { PostEditorDialog } from "@/components/calendar/post-editor-dialog";
import { Icon } from "@iconify/react";
import type { SocialNetwork } from "@/types";

interface CalendarViewProps {
    socialNetworks: SocialNetwork[];
}

interface PostItem {
    id: string;
    title: string;
    content: string;
    hashtags: string;
    publishDate: Date;
    publishTime: string | null;
    status: string;
    socialNetwork: SocialNetwork;
    rubric: { id: string; name: string } | null;
    images: { id: string; url: string; altText: string; sortOrder: number }[];
    contentPlanId: string;
}

const DAYS_HEADER = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function CalendarView({ socialNetworks }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [posts, setPosts] = useState<PostItem[]>([]);
    const [filterNetwork, setFilterNetwork] = useState<number | null>(null);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Load posts
    useEffect(() => {
        const from = new Date(year, month, 1);
        const to = new Date(year, month + 1, 0);

        startTransition(async () => {
            const data = await getPostsByDateRange(from, to, filterNetwork ?? undefined);
            setPosts(data as unknown as PostItem[]);
        });
    }, [year, month, filterNetwork]);

    // Navigate months
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToday = () => setCurrentDate(new Date());

    // Build calendar grid
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday = 0

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month fill
    for (let i = startDay - 1; i >= 0; i--) {
        const d = new Date(year, month, -i);
        days.push({ date: d, isCurrentMonth: false });
    }

    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Next month fill
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
        days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    const monthName = currentDate.toLocaleString("ru-RU", { month: "long", year: "numeric" });

    const getPostsForDate = (date: Date) => {
        return posts.filter(
            (p) => new Date(p.publishDate).toDateString() === date.toDateString()
        );
    };

    const today = new Date();

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={prevMonth} className="rounded-lg p-2 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h2 className="text-xl font-bold capitalize text-foreground min-w-[200px] text-center">
                        {monthName}
                    </h2>
                    <button onClick={nextMonth} className="rounded-lg p-2 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer">
                        <ChevronRight className="h-5 w-5" />
                    </button>
                    <button
                        onClick={goToday}
                        className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer"
                    >
                        Сегодня
                    </button>
                </div>

                {/* Network filter */}
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted" />
                    <button
                        onClick={() => setFilterNetwork(null)}
                        className={cn(
                            "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                            !filterNetwork
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Все
                    </button>
                    {socialNetworks.map((sn) => (
                        <button
                            key={sn.id}
                            onClick={() => setFilterNetwork(filterNetwork === sn.id ? null : sn.id)}
                            className={cn(
                                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                                filterNetwork === sn.id
                                    ? "text-white"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                            style={filterNetwork === sn.id ? { backgroundColor: sn.color } : {}}
                        >
                            <Icon icon={sn.iconName} className="h-3.5 w-3.5" />
                            {sn.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Days header */}
                <div className="grid grid-cols-7 border-b border-border bg-surface/50">
                    {DAYS_HEADER.map((day) => (
                        <div
                            key={day}
                            className="px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7">
                    {days.map((day, i) => {
                        const dayPosts = getPostsForDate(day.date);
                        const isToday = day.date.toDateString() === today.toDateString();

                        return (
                            <div
                                key={i}
                                className={cn(
                                    "min-h-[120px] border-b border-r border-border p-1.5 transition-colors",
                                    !day.isCurrentMonth && "bg-surface/30",
                                    day.isCurrentMonth && "hover:bg-card-hover"
                                )}
                            >
                                {/* Date number */}
                                <div className="mb-1 flex items-center justify-between px-1">
                                    <span
                                        className={cn(
                                            "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                                            isToday && "bg-primary text-primary-foreground",
                                            !isToday && day.isCurrentMonth && "text-foreground",
                                            !day.isCurrentMonth && "text-muted"
                                        )}
                                    >
                                        {day.date.getDate()}
                                    </span>
                                    {dayPosts.length > 0 && (
                                        <span className="text-[10px] text-muted">{dayPosts.length}</span>
                                    )}
                                </div>

                                {/* Posts */}
                                <div className="space-y-0.5">
                                    {dayPosts.slice(0, 3).map((post) => (
                                        <PostCard
                                            key={post.id}
                                            post={post}
                                            onClick={() => setSelectedPostId(post.id)}
                                        />
                                    ))}
                                    {dayPosts.length > 3 && (
                                        <div className="px-1 text-[10px] text-muted-foreground">
                                            +{dayPosts.length - 3} ещё
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Loading indicator */}
            {isPending && (
                <div className="flex items-center justify-center py-4">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            )}

            {/* Post editor dialog */}
            {selectedPostId && (
                <PostEditorDialog
                    postId={selectedPostId}
                    onClose={() => setSelectedPostId(null)}
                    onSave={() => {
                        setSelectedPostId(null);
                        // Refresh posts
                        const from = new Date(year, month, 1);
                        const to = new Date(year, month + 1, 0);
                        startTransition(async () => {
                            const data = await getPostsByDateRange(from, to, filterNetwork ?? undefined);
                            setPosts(data as unknown as PostItem[]);
                        });
                    }}
                />
            )}
        </div>
    );
}
