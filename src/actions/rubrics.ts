"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getUserId(): Promise<string> {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    return session.user.id;
}

export async function getRubrics() {
    const userId = await getUserId();
    return db.rubric.findMany({
        where: { userId },
        orderBy: { sortOrder: "asc" },
    });
}

export async function createRubric(data: {
    name: string;
    description: string;
    postsPerMonth: number;
}) {
    const userId = await getUserId();
    const maxSort = await db.rubric.aggregate({
        where: { userId },
        _max: { sortOrder: true },
    });

    const rubric = await db.rubric.create({
        data: {
            ...data,
            userId,
            sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
        },
    });

    revalidatePath("/content-plan/rubrics");
    revalidatePath("/content-plan");
    return rubric;
}

export async function updateRubric(
    id: string,
    data: {
        name?: string;
        description?: string;
        postsPerMonth?: number;
        isActive?: boolean;
        sortOrder?: number;
    }
) {
    const userId = await getUserId();

    const rubric = await db.rubric.update({
        where: { id, userId },
        data,
    });

    revalidatePath("/content-plan/rubrics");
    revalidatePath("/content-plan");
    return rubric;
}

export async function deleteRubric(id: string) {
    const userId = await getUserId();

    await db.rubric.delete({
        where: { id, userId },
    });

    revalidatePath("/content-plan/rubrics");
    revalidatePath("/content-plan");
}
