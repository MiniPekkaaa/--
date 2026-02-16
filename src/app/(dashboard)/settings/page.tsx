import { auth } from "@/lib/auth";
import { Settings, User, KeyRound } from "lucide-react";

export default async function SettingsPage() {
    const session = await auth();

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Настройки</h1>
                <p className="mt-1 text-muted-foreground">Управление аккаунтом</p>
            </div>

            {/* Profile */}
            <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                    <User className="h-5 w-5 text-primary" />
                    Профиль
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm text-muted-foreground">Email</label>
                        <div className="rounded-lg border border-border bg-surface/50 px-4 py-2.5 text-sm text-foreground">
                            {session?.user?.email}
                        </div>
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm text-muted-foreground">Имя</label>
                        <div className="rounded-lg border border-border bg-surface/50 px-4 py-2.5 text-sm text-foreground">
                            {session?.user?.name || "Не указано"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick links */}
            <div className="grid gap-4 sm:grid-cols-2">
                <a
                    href="/settings/ai"
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-card-hover cursor-pointer"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Settings className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-medium text-foreground">AI Настройки</h3>
                        <p className="text-xs text-muted-foreground">API ключи и модели</p>
                    </div>
                </a>

                <a
                    href="/content-plan/rubrics"
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-card-hover cursor-pointer"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <KeyRound className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-medium text-foreground">Рубрики</h3>
                        <p className="text-xs text-muted-foreground">Управление рубриками</p>
                    </div>
                </a>
            </div>
        </div>
    );
}
