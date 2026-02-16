import { getPostStats } from "@/actions/posts";
import { getContentPlans } from "@/actions/content-plan";
import { CalendarDays, FileText, CheckCircle, Send, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
    const [stats, plans] = await Promise.all([
        getPostStats(),
        getContentPlans(),
    ]);

    const statCards = [
        { label: "Всего постов", value: stats.totalPosts, icon: FileText, color: "text-primary" },
        { label: "Черновики", value: stats.draftPosts, icon: CalendarDays, color: "text-warning" },
        { label: "Одобрено", value: stats.approvedPosts, icon: CheckCircle, color: "text-success" },
        { label: "Опубликовано", value: stats.publishedPosts, icon: Send, color: "text-info" },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">Дашборд</h1>
                <p className="mt-1 text-muted-foreground">Обзор вашего контента</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-card-hover"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{stat.label}</span>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                        <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Content Plans */}
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Контент-планы</h2>
                    <a
                        href="/content-plan"
                        className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 cursor-pointer"
                    >
                        <TrendingUp className="h-4 w-4" />
                        Создать план
                    </a>
                </div>

                {plans.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
                        <FileText className="mx-auto h-12 w-12 text-muted" />
                        <h3 className="mt-4 text-lg font-medium text-foreground">Нет контент-планов</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Создайте свой первый контент-план для соцсетей
                        </p>
                        <a
                            href="/content-plan"
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover cursor-pointer"
                        >
                            Создать контент-план
                        </a>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-card-hover cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium text-foreground">
                                        {plan.title || "Контент-план"}
                                    </h3>
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${plan.status === "completed"
                                            ? "bg-success/20 text-success"
                                            : plan.status === "generating"
                                                ? "bg-warning/20 text-warning"
                                                : plan.status === "failed"
                                                    ? "bg-error/20 text-error"
                                                    : "bg-muted/20 text-muted-foreground"
                                        }`}>
                                        {plan.status === "completed" ? "Готово" : plan.status === "generating" ? "Генерация" : plan.status === "failed" ? "Ошибка" : "Черновик"}
                                    </span>
                                </div>

                                <div className="mt-3 flex gap-1.5">
                                    {plan.socialNetworks.map((sn) => (
                                        <span
                                            key={sn.socialNetwork.slug}
                                            className="rounded-md px-2 py-0.5 text-xs font-medium"
                                            style={{
                                                backgroundColor: `${sn.socialNetwork.color}20`,
                                                color: sn.socialNetwork.color,
                                            }}
                                        >
                                            {sn.socialNetwork.name}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{plan._count.posts} постов</span>
                                    <span>
                                        {new Date(plan.startDate).toLocaleDateString("ru-RU", {
                                            day: "numeric",
                                            month: "short",
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
