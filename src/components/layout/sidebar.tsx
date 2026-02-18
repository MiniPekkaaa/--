"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
    LayoutDashboard,
    CalendarDays,
    FileText,
    List,
    Settings,
    Bot,
    LogOut,
    Zap,
    ChevronDown,
    MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const mainNav = [
    { href: "/brief", label: "Начало работы", icon: MessageCircle },
    { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
    { href: "/calendar", label: "Календарь", icon: CalendarDays },
];

const contentNav = [
    { href: "/content-plan", label: "Контент-план", icon: FileText },
    { href: "/content-plan/rubrics", label: "Рубрики", icon: List },
];

const settingsNav = [
    { href: "/settings", label: "Настройки", icon: Settings },
    { href: "/settings/ai", label: "AI Настройки", icon: Bot },
];

function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 cursor-pointer",
                isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
            )}
        >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
        </Link>
    );
}

function NavSection({ title, items, defaultOpen = true }: {
    title: string;
    items: typeof mainNav;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div>
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted cursor-pointer hover:text-muted-foreground transition-colors"
            >
                {title}
                <ChevronDown className={cn("h-3 w-3 transition-transform", !open && "-rotate-90")} />
            </button>
            {open && (
                <div className="space-y-0.5 animate-fade-in">
                    {items.map((item) => (
                        <NavItem key={item.href} {...item} />
                    ))}
                </div>
            )}
        </div>
    );
}

export function AppSidebar({ userName }: { userName: string }) {
    return (
        <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-[oklch(14%_0.015_270)]">
            {/* Logo */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                    <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <span className="text-sm font-bold text-foreground">Контент-Машина</span>
                </div>
            </div>

            {/* User */}
            <div className="border-b border-border px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                        {userName?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{userName || "Пользователь"}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
                <div className="space-y-0.5">
                    {mainNav.map((item) => (
                        <NavItem key={item.href} {...item} />
                    ))}
                </div>

                <NavSection title="Контент" items={contentNav} />
                <NavSection title="Настройки" items={settingsNav} />
            </nav>

            {/* Bottom */}
            <div className="border-t border-border p-3">
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground cursor-pointer"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Выйти</span>
                </button>
            </div>
        </aside>
    );
}
