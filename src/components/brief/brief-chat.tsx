"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    Send as SendHorizontal,
    Paperclip,
    FileText,
    FileSpreadsheet,
    File as FileIcon,
    Loader2,
    Sparkles,
    X,
    Plus,
    ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
}

interface BriefFileInfo {
    id: string;
    originalName: string;
    mimeType: string;
    fileSize: number;
    hasText?: boolean;
    textPreview?: string;
    createdAt?: string;
    extractedText?: string | null;
}

interface BriefChatProps {
    sessionId: string;
    initialMessages: Message[];
    initialFiles: BriefFileInfo[];
    welcomeMessage: string;
}

function getFileIcon(mimeType: string) {
    if (mimeType.includes("pdf")) return FileText;
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return FileSpreadsheet;
    return FileIcon;
}

function formatFileSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
}

export function BriefChat({ sessionId, initialMessages, initialFiles, welcomeMessage }: BriefChatProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [files, setFiles] = useState<BriefFileInfo[]>(initialFiles);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [briefText, setBriefText] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => scrollToBottom(), [messages, scrollToBottom]);

    // Auto-resize textarea
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }, [input]);

    // ── Send text message ──
    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: `temp-${Date.now()}`,
            role: "user",
            content: input.trim(),
            createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/brief/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, message: userMsg.content }),
            });

            if (!res.ok) throw new Error("Chat failed");

            // Stream response
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let assistantContent = "";
            const assistantId = `temp-${Date.now()}-ai`;

            setMessages((prev) => [
                ...prev,
                { id: assistantId, role: "assistant", content: "", createdAt: new Date().toISOString() },
            ]);

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const text = decoder.decode(value);
                    const lines = text.split("\n");

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const data = line.slice(6);
                            if (data === "[DONE]") continue;
                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.content) {
                                    assistantContent += parsed.content;
                                    setMessages((prev) =>
                                        prev.map((m) =>
                                            m.id === assistantId
                                                ? { ...m, content: assistantContent }
                                                : m
                                        )
                                    );
                                }
                            } catch {
                                // skip
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Send error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    id: `err-${Date.now()}`,
                    role: "assistant",
                    content: "Произошла ошибка. Попробуйте ещё раз.",
                    createdAt: new Date().toISOString(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Upload file ──
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("sessionId", sessionId);
            formData.append("file", file);

            const res = await fetch("/api/brief/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const result = await res.json();
            setFiles((prev) => [...prev, result]);

            // Show system notification about upload
            setMessages((prev) => [
                ...prev,
                {
                    id: `sys-upload-${Date.now()}`,
                    role: "user",
                    content: `✅ Файл загружен: ${file.name} (${formatFileSize(file.size)})`,
                    createdAt: new Date().toISOString(),
                },
            ]);

            // Send simple message to AI — it already has the file text in context
            const autoMsg = `Пользователь загрузил файл "${file.name}".`;

            const chatRes = await fetch("/api/brief/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, message: autoMsg }),
            });

            if (chatRes.ok) {
                const reader = chatRes.body?.getReader();
                const decoder = new TextDecoder();
                let aiContent = "";
                const aiId = `ai-file-${Date.now()}`;

                setMessages((prev) => [
                    ...prev,
                    { id: aiId, role: "assistant", content: "", createdAt: new Date().toISOString() },
                ]);

                if (reader) {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        const text = decoder.decode(value);
                        const lines = text.split("\n");
                        for (const line of lines) {
                            if (line.startsWith("data: ")) {
                                const data = line.slice(6);
                                if (data === "[DONE]") continue;
                                try {
                                    const parsed = JSON.parse(data);
                                    if (parsed.content) {
                                        aiContent += parsed.content;
                                        setMessages((prev) =>
                                            prev.map((m) =>
                                                m.id === aiId ? { ...m, content: aiContent } : m
                                            )
                                        );
                                    }
                                } catch { /* skip */ }
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Upload error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    id: `err-${Date.now()}`,
                    role: "assistant",
                    content: "Ошибка загрузки файла. Попробуйте другой файл.",
                    createdAt: new Date().toISOString(),
                },
            ]);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // ── Generate brief ──
    const generateBrief = async () => {
        setIsGenerating(true);
        setMessages((prev) => [
            ...prev,
            {
                id: `gen-${Date.now()}`,
                role: "assistant",
                content: "⏳ Генерирую бриф на основе всех загруженных материалов...",
                createdAt: new Date().toISOString(),
            },
        ]);

        try {
            const res = await fetch("/api/brief/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Generation failed");
            }

            const { briefText: text } = await res.json();
            setBriefText(text);

            setMessages((prev) => [
                ...prev.filter((m) => !m.id.startsWith("gen-")),
                {
                    id: `brief-${Date.now()}`,
                    role: "assistant",
                    content: `📋 **Бриф создан!**\n\n${text}`,
                    createdAt: new Date().toISOString(),
                },
            ]);
        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : "Ошибка генерации";
            setMessages((prev) => [
                ...prev.filter((m) => !m.id.startsWith("gen-")),
                {
                    id: `err-${Date.now()}`,
                    role: "assistant",
                    content: `❌ ${errMsg}`,
                    createdAt: new Date().toISOString(),
                },
            ]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const hasContent = files.length > 0 || messages.some((m) => m.role === "user" && m.content.length > 20);

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="mx-auto max-w-3xl space-y-4">
                    {/* Welcome message */}
                    <div className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <div className="rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-3 text-sm text-foreground max-w-[80%]">
                            {welcomeMessage}
                        </div>
                    </div>

                    {/* File badges (if any loaded) */}
                    {files.length > 0 && (
                        <div className="flex flex-wrap gap-2 ml-11">
                            {files.map((f) => {
                                const Icon = getFileIcon(f.mimeType);
                                return (
                                    <span
                                        key={f.id}
                                        className="flex items-center gap-1.5 rounded-lg bg-surface px-2.5 py-1.5 text-xs text-muted-foreground border border-border"
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                        {f.originalName}
                                        <span className="text-muted">({formatFileSize(f.fileSize)})</span>
                                    </span>
                                );
                            })}
                        </div>
                    )}

                    {/* Messages */}
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex gap-3",
                                msg.role === "user" ? "justify-end" : "justify-start"
                            )}
                        >
                            {msg.role === "assistant" && (
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                </div>
                            )}
                            <div
                                className={cn(
                                    "rounded-2xl px-4 py-3 text-sm max-w-[80%] whitespace-pre-wrap",
                                    msg.role === "user"
                                        ? "rounded-br-sm bg-primary text-primary-foreground"
                                        : "rounded-tl-sm bg-card border border-border text-foreground"
                                )}
                            >
                                {msg.content || (
                                    <span className="flex items-center gap-2 text-muted-foreground">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Печатает...
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Bottom input area */}
            <div className="border-t border-border bg-card/50 backdrop-blur-sm px-4 py-3">
                <div className="mx-auto max-w-3xl space-y-3">
                    {/* Generate brief button */}
                    {hasContent && !briefText && (
                        <button
                            onClick={generateBrief}
                            disabled={isGenerating || isLoading}
                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary transition-all hover:bg-primary/10 hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Генерация брифа...
                                </>
                            ) : (
                                <>
                                    <ClipboardCheck className="h-4 w-4" />
                                    Создать бриф
                                </>
                            )}
                        </button>
                    )}

                    {/* Input row */}
                    <div className="flex items-end gap-2">
                        {/* File upload */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                            onChange={handleFileUpload}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading || isLoading}
                            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground transition-all hover:bg-surface-hover hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Загрузить файл"
                        >
                            {isUploading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Paperclip className="h-4 w-4" />
                            )}
                        </button>

                        {/* Text input */}
                        <div className="relative flex flex-1 items-end rounded-2xl border border-border bg-card px-4 py-2.5 transition-all focus-within:border-primary/40">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Напишите сообщение или загрузите файл..."
                                rows={1}
                                disabled={isLoading}
                                className="min-h-[28px] max-h-[160px] flex-1 resize-none bg-transparent text-sm text-foreground placeholder-muted outline-none disabled:opacity-50"
                            />
                        </div>

                        {/* Send */}
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || isLoading}
                            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <SendHorizontal className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
