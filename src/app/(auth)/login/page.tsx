"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError("Неверный email или пароль");
            setLoading(false);
        } else {
            router.push("/dashboard");
            router.refresh();
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-8">
                {/* Logo */}
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                        <Zap className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Контент-Машина
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Войдите для создания контент-планов
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="rounded-xl border border-border bg-card p-6 shadow-lg shadow-black/20">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="demo@contentmachine.ru"
                                    className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-foreground placeholder-muted transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
                                    Пароль
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-foreground placeholder-muted transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    required
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-error">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full cursor-pointer rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? "Вход..." : "Войти"}
                            </button>
                        </div>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                        Нет аккаунта?{" "}
                        <a href="/register" className="text-primary hover:text-primary-hover transition-colors">
                            Зарегистрироваться
                        </a>
                    </p>

                    {/* Demo hint */}
                    <div className="rounded-lg border border-border/50 bg-surface/50 p-3 text-center text-xs text-muted-foreground">
                        <span className="font-medium text-foreground/70">Демо:</span>{" "}
                        demo@contentmachine.ru / demo1234
                    </div>
                </form>
            </div>
        </div>
    );
}
