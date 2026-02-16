"use client";

import { useState, useEffect, useTransition } from "react";
import { X, Save, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";
import { getPost, updatePost, deletePost } from "@/actions/posts";
import { Icon } from "@iconify/react";

interface PostEditorDialogProps {
    postId: string;
    onClose: () => void;
    onSave: () => void;
}

interface PostDetail {
    id: string;
    title: string;
    content: string;
    hashtags: string;
    publishDate: Date;
    publishTime: string | null;
    status: string;
    socialNetwork: { id: number; slug: string; name: string; color: string; iconName: string };
    rubric: { id: string; name: string } | null;
}

export function PostEditorDialog({ postId, onClose, onSave }: PostEditorDialogProps) {
    const [post, setPost] = useState<PostDetail | null>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [hashtags, setHashtags] = useState("");
    const [status, setStatus] = useState("draft");
    const [isPending, startTransition] = useTransition();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const data = await getPost(postId);
            if (data) {
                setPost(data as unknown as PostDetail);
                setTitle(data.title);
                setContent(data.content);
                setHashtags(data.hashtags);
                setStatus(data.status);
            }
            setLoading(false);
        })();
    }, [postId]);

    const handleSave = () => {
        startTransition(async () => {
            await updatePost(postId, { title, content, hashtags, status });
            toast.success("Пост сохранён");
            onSave();
        });
    };

    const handleDelete = () => {
        if (!confirm("Удалить этот пост?")) return;
        startTransition(async () => {
            await deletePost(postId);
            toast.success("Пост удалён");
            onSave();
        });
    };

    const handleCopy = () => {
        const text = `${title}\n\n${content}\n\n${hashtags}`;
        navigator.clipboard.writeText(text);
        toast.success("Скопировано в буфер обмена");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl animate-scale-in rounded-2xl border border-border bg-card shadow-2xl shadow-black/40">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <div className="flex items-center gap-3">
                        {post && (
                            <div
                                className="flex items-center gap-2 rounded-lg px-2.5 py-1 text-xs font-medium"
                                style={{
                                    backgroundColor: `${post.socialNetwork.color}20`,
                                    color: post.socialNetwork.color,
                                }}
                            >
                                <Icon icon={post.socialNetwork.iconName} className="h-3.5 w-3.5" />
                                {post.socialNetwork.name}
                            </div>
                        )}
                        {post?.rubric && (
                            <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                                {post.rubric.name}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                ) : (
                    <div className="space-y-4 p-6">
                        {/* Title */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Заголовок</label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="Заголовок поста"
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Текст поста</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={8}
                                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none font-mono text-sm leading-relaxed"
                                placeholder="Напишите текст поста..."
                            />
                            <div className="mt-1 text-right text-xs text-muted">
                                {content.length} символов
                            </div>
                        </div>

                        {/* Hashtags */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Хештеги</label>
                            <input
                                value={hashtags}
                                onChange={(e) => setHashtags(e.target.value)}
                                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="#хештег1 #хештег2"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Статус</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none cursor-pointer"
                            >
                                <option value="draft">Черновик</option>
                                <option value="review">На проверке</option>
                                <option value="approved">Одобрен</option>
                                <option value="published">Опубликован</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border px-6 py-4">
                    <button
                        onClick={handleDelete}
                        disabled={isPending}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors cursor-pointer"
                    >
                        <Trash2 className="h-4 w-4" />
                        Удалить
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer"
                        >
                            <Copy className="h-4 w-4" />
                            Копировать
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isPending}
                            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-60"
                        >
                            <Save className="h-4 w-4" />
                            {isPending ? "Сохранение..." : "Сохранить"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
