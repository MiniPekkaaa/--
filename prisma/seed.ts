import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_RUBRICS = [
    {
        name: "Образование",
        description: "Контент, который учит, объясняет, даёт лайфхаки.",
        postsPerMonth: 6,
        sortOrder: 0,
    },
    {
        name: "Вдохновение + Мотивация",
        description: "Истории клиентов, кейсы трансформации, социальное доказательство.",
        postsPerMonth: 2,
        sortOrder: 1,
    },
    {
        name: "Развлечение",
        description: "Контент, который не учит и не продаёт — просто нравится, смешит, занимает.",
        postsPerMonth: 4,
        sortOrder: 2,
    },
    {
        name: "Активность сообщества",
        description: "Контент, который создаёт диалог, включает аудиторию.",
        postsPerMonth: 2,
        sortOrder: 3,
    },
    {
        name: "Прямые продажи",
        description: "Контент, который явно нацелен на покупку.",
        postsPerMonth: 4,
        sortOrder: 4,
    },
    {
        name: "Бренд и ценности",
        description: "Миссия, история, как вы работаете, почему вы это делаете.",
        postsPerMonth: 2,
        sortOrder: 5,
    },
];

const SOCIAL_NETWORKS = [
    {
        slug: "telegram",
        name: "Telegram",
        color: "#26A5E4",
        iconName: "simple-icons:telegram",
    },
    {
        slug: "instagram",
        name: "Instagram",
        color: "#E4405F",
        iconName: "simple-icons:instagram",
    },
    {
        slug: "vk",
        name: "VK",
        color: "#0077FF",
        iconName: "simple-icons:vk",
    },
    {
        slug: "threads",
        name: "Threads",
        color: "#000000",
        iconName: "simple-icons:threads",
    },
];

async function main() {
    console.log("🌱 Seeding database...");

    // Create social networks
    for (const network of SOCIAL_NETWORKS) {
        await prisma.socialNetwork.upsert({
            where: { slug: network.slug },
            update: network,
            create: network,
        });
    }
    console.log("✅ Social networks seeded");

    // Create demo user
    const passwordHash = await hash("demo1234", 12);
    const user = await prisma.user.upsert({
        where: { email: "demo@contentmachine.ru" },
        update: {},
        create: {
            email: "demo@contentmachine.ru",
            name: "Демо Пользователь",
            passwordHash,
        },
    });
    console.log("✅ Demo user created:", user.email);

    // Create default rubrics for user
    for (const rubric of DEFAULT_RUBRICS) {
        const existing = await prisma.rubric.findFirst({
            where: { userId: user.id, name: rubric.name },
        });
        if (!existing) {
            await prisma.rubric.create({
                data: { ...rubric, userId: user.id },
            });
        }
    }
    console.log("✅ Default rubrics created");

    // Create AI settings for user
    await prisma.aISettings.upsert({
        where: { userId: user.id },
        update: {},
        create: {
            userId: user.id,
            defaultProvider: "openai",
            defaultModel: "gpt-5.2",
        },
    });
    console.log("✅ AI settings created");

    console.log("🎉 Seeding completed!");
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
