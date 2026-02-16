export const CONTENT_PLAN_PROMPT = `Ты — профессиональный SMM-специалист и контент-стратег. 
Создай подробный контент-план на основе следующих параметров:

Социальные сети: {socialNetworks}
Рубрики и количество постов в месяц:
{rubrics}

Частота: {postsPerWeek} постов в неделю
Дни публикаций: {publishDays}
Дата начала: {startDate}

Пожелания пользователя:
{wishes}

Для каждого поста укажи:
1. Дату публикации
2. Социальную сеть
3. Рубрику
4. Заголовок поста
5. Полный текст поста (не менее 200 символов)
6. Хештеги (5-10 штук)

Формат ответа — JSON массив объектов:
[
  {{
    "publishDate": "YYYY-MM-DD",
    "socialNetwork": "telegram|instagram|vk|threads",
    "rubric": "Название рубрики",
    "title": "Заголовок",
    "content": "Полный текст поста...",
    "hashtags": "#хештег1 #хештег2 ..."
  }}
]

Важно:
- Распредели посты равномерно по указанным дням
- Учитывай специфику каждой соцсети (длина текста, стиль)
- Контент должен быть разнообразным и вовлекающим
- Используй актуальные тренды и форматы
- Генерируй план на 1 месяц вперёд от даты начала`;

export const IMPROVE_POST_PROMPT = `Ты — профессиональный копирайтер для социальных сетей.
Улучши следующий пост для {socialNetwork}:

Текущий текст:
{content}

Инструкции по улучшению:
{instructions}

Верни только улучшенный текст поста, без объяснений.`;

export function buildContentPlanPrompt(params: {
    socialNetworks: string[];
    rubrics: { name: string; postsPerMonth: number }[];
    postsPerWeek: number;
    publishDays: string[];
    startDate: string;
    wishes: string;
}): string {
    return CONTENT_PLAN_PROMPT
        .replace("{socialNetworks}", params.socialNetworks.join(", "))
        .replace(
            "{rubrics}",
            params.rubrics.map((r) => `- ${r.name}: ${r.postsPerMonth} постов/мес`).join("\n")
        )
        .replace("{postsPerWeek}", String(params.postsPerWeek))
        .replace("{publishDays}", params.publishDays.join(", "))
        .replace("{startDate}", params.startDate)
        .replace("{wishes}", params.wishes || "Нет особых пожеланий");
}

export function buildImprovePostPrompt(params: {
    socialNetwork: string;
    content: string;
    instructions: string;
}): string {
    return IMPROVE_POST_PROMPT
        .replace("{socialNetwork}", params.socialNetwork)
        .replace("{content}", params.content)
        .replace("{instructions}", params.instructions);
}
