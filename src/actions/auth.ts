"use server";

import { db } from "@/lib/db";
import { hash } from "bcryptjs";

const DEFAULT_RUBRICS = [
    { name: "Образование", description: "Контент, который учит, объясняет, даёт лайфхаки.", postsPerMonth: 6, sortOrder: 0 },
    { name: "Вдохновение + Мотивация", description: "Истории клиентов, кейсы трансформации, социальное доказательство.", postsPerMonth: 2, sortOrder: 1 },
    { name: "Развлечение", description: "Контент, который не учит и не продаёт — просто нравится, смешит, занимает.", postsPerMonth: 4, sortOrder: 2 },
    { name: "Активность сообщества", description: "Контент, который создаёт диалог, включает аудиторию.", postsPerMonth: 2, sortOrder: 3 },
    { name: "Прямые продажи", description: "Контент, который явно нацелен на покупку.", postsPerMonth: 4, sortOrder: 4 },
    { name: "Бренд и ценности", description: "Миссия, история, как вы работаете, почему вы это делаете.", postsPerMonth: 2, sortOrder: 5 },
];

export async function registerUser(data: {
    name: string;
    email: string;
    password: string;
}) {
    try {
        const existing = await db.user.findUnique({
            where: { email: data.email },
        });

        if (existing) {
            return { error: "Пользователь с таким email уже существует" };
        }

        if (data.password.length < 6) {
            return { error: "Пароль должен содержать минимум 6 символов" };
        }

        const passwordHash = await hash(data.password, 12);

        const user = await db.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash,
            },
        });

        // Create default rubrics
        await db.rubric.createMany({
            data: DEFAULT_RUBRICS.map((r) => ({ ...r, userId: user.id })),
        });

        // Create default AI settings
        await db.aISettings.create({
            data: { userId: user.id },
        });

        return { success: true };
    } catch {
        return { error: "Ошибка при регистрации" };
    }
}
