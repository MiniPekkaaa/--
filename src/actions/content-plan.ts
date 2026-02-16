"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ContentPlanFormData } from "@/types";

async function getUserId(): Promise<string> {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    return session.user.id;
}

export async function createContentPlan(data: ContentPlanFormData) {
    const userId = await getUserId();

    const plan = await db.contentPlan.create({
        data: {
            userId,
            startDate: data.startDate,
            postsPerWeek: data.postsPerWeek,
            publishDays: data.publishDays,
            wishes: data.wishes,
            aiProvider: data.aiProvider,
            aiModel: data.aiModel,
            status: "draft",
            socialNetworks: {
                create: data.socialNetworkIds.map((id) => ({
                    socialNetworkId: id,
                })),
            },
            rubrics: {
                create: data.rubricIds.map((id) => ({
                    rubricId: id,
                })),
            },
        },
        include: {
            socialNetworks: { include: { socialNetwork: true } },
            rubrics: { include: { rubric: true } },
        },
    });

    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    return plan;
}

export async function getContentPlans() {
    const userId = await getUserId();
    return db.contentPlan.findMany({
        where: { userId },
        include: {
            socialNetworks: { include: { socialNetwork: true } },
            rubrics: { include: { rubric: true } },
            _count: { select: { posts: true } },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function getSocialNetworks() {
    return db.socialNetwork.findMany({
        orderBy: { id: "asc" },
    });
}

export async function generateContentPlanPosts(contentPlanId: string) {
    const userId = await getUserId();

    const plan = await db.contentPlan.findUnique({
        where: { id: contentPlanId, userId },
        include: {
            socialNetworks: { include: { socialNetwork: true } },
            rubrics: { include: { rubric: true } },
        },
    });

    if (!plan) throw new Error("Plan not found");

    // Update status
    await db.contentPlan.update({
        where: { id: contentPlanId },
        data: { status: "generating" },
    });

    // Generate dates based on publishDays and postsPerWeek
    const posts: Array<{
        publishDate: Date;
        socialNetworkId: number;
        rubricId: string | null;
        title: string;
        content: string;
        hashtags: string;
    }> = [];

    const startDate = new Date(plan.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const socialNetworks = plan.socialNetworks.map((sn) => sn.socialNetwork);
    const rubrics = plan.rubrics.map((r) => r.rubric);

    // Build a calendar of publish dates
    const publishDates: Date[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        if (plan.publishDays.includes(dayOfWeek)) {
            publishDates.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Distribute posts across dates, social networks, and rubrics
    let rubricIndex = 0;
    let socialIndex = 0;

    for (const date of publishDates) {
        for (const network of socialNetworks) {
            const rubric = rubrics[rubricIndex % rubrics.length];
            posts.push({
                publishDate: date,
                socialNetworkId: network.id,
                rubricId: rubric?.id || null,
                title: `${rubric?.name || "Пост"} для ${network.name}`,
                content: `Пост для ${network.name} в рубрике "${rubric?.name || "Общее"}".\n\n${plan.wishes ? `Тема: ${plan.wishes}` : "Контент будет сгенерирован AI."}`,
                hashtags: `#${network.slug} #контентплан #smm`,
            });
            socialIndex++;
        }
        rubricIndex++;
    }

    // Save posts to database
    if (posts.length > 0) {
        await db.post.createMany({
            data: posts.map((p, i) => ({
                contentPlanId,
                userId,
                socialNetworkId: p.socialNetworkId,
                rubricId: p.rubricId,
                title: p.title,
                content: p.content,
                hashtags: p.hashtags,
                publishDate: p.publishDate,
                status: "draft",
                sortOrder: i,
            })),
        });
    }

    // Update plan status
    await db.contentPlan.update({
        where: { id: contentPlanId },
        data: { status: "completed" },
    });

    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    return { postsCount: posts.length };
}
