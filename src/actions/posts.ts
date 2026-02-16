"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getUserId(): Promise<string> {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    return session.user.id;
}

export async function getPostsByDateRange(from: Date, to: Date, socialNetworkId?: number) {
    const userId = await getUserId();

    const where: Record<string, unknown> = {
        userId,
        publishDate: {
            gte: from,
            lte: to,
        },
    };

    if (socialNetworkId) {
        where.socialNetworkId = socialNetworkId;
    }

    return db.post.findMany({
        where,
        include: {
            socialNetwork: true,
            rubric: true,
            images: { orderBy: { sortOrder: "asc" } },
        },
        orderBy: [{ publishDate: "asc" }, { sortOrder: "asc" }],
    });
}

export async function getPost(id: string) {
    const userId = await getUserId();

    return db.post.findUnique({
        where: { id, userId },
        include: {
            socialNetwork: true,
            rubric: true,
            images: { orderBy: { sortOrder: "asc" } },
            contentPlan: {
                include: {
                    socialNetworks: { include: { socialNetwork: true } },
                },
            },
        },
    });
}

export async function updatePost(
    id: string,
    data: {
        title?: string;
        content?: string;
        hashtags?: string;
        publishDate?: Date;
        publishTime?: string;
        status?: string;
        rubricId?: string;
        socialNetworkId?: number;
    }
) {
    const userId = await getUserId();

    const post = await db.post.update({
        where: { id, userId },
        data,
    });

    revalidatePath("/calendar");
    revalidatePath(`/posts/${id}`);
    return post;
}

export async function deletePost(id: string) {
    const userId = await getUserId();

    await db.post.delete({
        where: { id, userId },
    });

    revalidatePath("/calendar");
    revalidatePath("/dashboard");
}

export async function getPostStats() {
    const userId = await getUserId();

    const [totalPosts, draftPosts, approvedPosts, publishedPosts] = await Promise.all([
        db.post.count({ where: { userId } }),
        db.post.count({ where: { userId, status: "draft" } }),
        db.post.count({ where: { userId, status: "approved" } }),
        db.post.count({ where: { userId, status: "published" } }),
    ]);

    return { totalPosts, draftPosts, approvedPosts, publishedPosts };
}
