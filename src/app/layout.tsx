import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
    subsets: ["latin", "cyrillic"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Контент-Машина — AI генератор контент-планов",
    description:
        "Создавайте контент-планы для Telegram, Instagram, VK и Threads с помощью AI. Планируйте, генерируйте и управляйте постами в одном месте.",
    keywords: ["контент-план", "SMM", "AI", "социальные сети", "Telegram", "Instagram"],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ru" className="dark">
            <body className={`${inter.variable} font-sans antialiased`}>
                {children}
                <Toaster
                    theme="dark"
                    position="bottom-right"
                    toastOptions={{
                        style: {
                            background: "oklch(18% 0.015 270)",
                            border: "1px solid oklch(28% 0.02 270)",
                            color: "oklch(95% 0.005 270)",
                        },
                    }}
                />
            </body>
        </html>
    );
}
