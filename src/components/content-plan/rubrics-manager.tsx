"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, GripVertical, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { cn, RUBRIC_COLORS } from "@/lib/utils";
import { createRubric, updateRubric, deleteRubric } from "@/actions/rubrics";
import type { RubricData } from "@/types";

interface RubricsManagerProps {
    initialRubrics: RubricData[];
}

export function RubricsManager({ initialRubrics }: RubricsManagerProps) {
    const [rubrics, setRubrics] = useState(initialRubrics);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editCount, setEditCount] = useState(4);
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newCount, setNewCount] = useState(4);
    const [isPending, startTransition] = useTransition();

    const startEdit = (rubric: RubricData) => {
        setEditingId(rubric.id);
        setEditName(rubric.name);
        setEditDesc(rubric.description);
        setEditCount(rubric.postsPerMonth);
    };

    const saveEdit = (id: string) => {
        startTransition(async () => {
            const updated = await updateRubric(id, {
                name: editName,
                description: editDesc,
                postsPerMonth: editCount,
            });
            setRubrics((prev) =>
                prev.map((r) => (r.id === id ? { ...r, name: updated.name, description: updated.description, postsPerMonth: updated.postsPerMonth } : r))
            );
            setEditingId(null);
            toast.success("Рубрика обновлена");
        });
    };

    const handleDelete = (id: string) => {
        startTransition(async () => {
            await deleteRubric(id);
            setRubrics((prev) => prev.filter((r) => r.id !== id));
            toast.success("Рубрика удалена");
        });
    };

    const handleAdd = () => {
        if (!newName.trim()) {
            toast.error("Введите название рубрики");
            return;
        }
        startTransition(async () => {
            const rubric = await createRubric({
                name: newName,
                description: newDesc,
                postsPerMonth: newCount,
            });
            setRubrics((prev) => [
                ...prev,
                {
                    id: rubric.id,
                    name: rubric.name,
                    description: rubric.description,
                    postsPerMonth: rubric.postsPerMonth,
                    sortOrder: rubric.sortOrder,
                    isActive: rubric.isActive,
                },
            ]);
            setNewName("");
            setNewDesc("");
            setNewCount(4);
            setShowAdd(false);
            toast.success("Рубрика создана");
        });
    };

    return (
        <div className="space-y-4">
            {/* Rubrics list */}
            <div className="space-y-2">
                {rubrics.map((rubric, i) => {
                    const colorClass = RUBRIC_COLORS[i % RUBRIC_COLORS.length];
                    const isEditing = editingId === rubric.id;

                    return (
                        <div
                            key={rubric.id}
                            className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-card-hover"
                        >
                            {isEditing ? (
                                <div className="space-y-3">
                                    <input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                        placeholder="Название"
                                    />
                                    <input
                                        value={editDesc}
                                        onChange={(e) => setEditDesc(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                        placeholder="Описание"
                                    />
                                    <div className="flex items-center gap-3">
                                        <label className="text-xs text-muted-foreground">Постов/мес:</label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={30}
                                            value={editCount}
                                            onChange={(e) => setEditCount(Number(e.target.value))}
                                            className="w-20 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                                        />
                                        <div className="ml-auto flex gap-2">
                                            <button
                                                onClick={() => saveEdit(rubric.id)}
                                                disabled={isPending}
                                                className="rounded-lg bg-success/20 p-2 text-success hover:bg-success/30 transition-colors cursor-pointer"
                                            >
                                                <Check className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="rounded-lg bg-surface p-2 text-muted-foreground hover:bg-surface-hover transition-colors cursor-pointer"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <GripVertical className="h-4 w-4 cursor-grab text-muted" />
                                    <div
                                        className="h-3 w-3 shrink-0 rounded-full"
                                        style={{ backgroundColor: `oklch(60% 0.2 ${(i * 55 + 265) % 360})` }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-foreground">{rubric.name}</span>
                                            <span className={cn("rounded-full border px-2 py-0.5 text-xs", colorClass)}>
                                                {rubric.postsPerMonth} постов/мес
                                            </span>
                                        </div>
                                        <p className="mt-0.5 text-xs text-muted truncate">{rubric.description}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => startEdit(rubric)}
                                            className="rounded-lg p-2 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(rubric.id)}
                                            disabled={isPending}
                                            className="rounded-lg p-2 text-muted-foreground hover:bg-error/10 hover:text-error transition-colors cursor-pointer"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Add rubric */}
            {showAdd ? (
                <div className="rounded-xl border border-primary/20 bg-card p-4 animate-slide-up">
                    <h3 className="mb-3 text-sm font-semibold text-foreground">Новая рубрика</h3>
                    <div className="space-y-3">
                        <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                            placeholder="Название"
                            autoFocus
                        />
                        <input
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                            placeholder="Описание"
                        />
                        <div className="flex items-center gap-3">
                            <label className="text-xs text-muted-foreground">Постов/мес:</label>
                            <input
                                type="number"
                                min={1}
                                max={30}
                                value={newCount}
                                onChange={(e) => setNewCount(Number(e.target.value))}
                                className="w-20 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                            />
                            <div className="ml-auto flex gap-2">
                                <button
                                    onClick={handleAdd}
                                    disabled={isPending}
                                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors cursor-pointer"
                                >
                                    Создать
                                </button>
                                <button
                                    onClick={() => setShowAdd(false)}
                                    className="rounded-lg bg-surface px-4 py-2 text-sm text-muted-foreground hover:bg-surface-hover transition-colors cursor-pointer"
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setShowAdd(true)}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                >
                    <Plus className="h-4 w-4" />
                    Добавить рубрику
                </button>
            )}
        </div>
    );
}
