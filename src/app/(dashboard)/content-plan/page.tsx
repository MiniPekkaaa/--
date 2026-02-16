import { getRubrics } from "@/actions/rubrics";
import { getSocialNetworks } from "@/actions/content-plan";
import { ContentPlanForm } from "@/components/content-plan/content-plan-form";

export default async function ContentPlanPage() {
    const [socialNetworks, rubrics] = await Promise.all([
        getSocialNetworks(),
        getRubrics(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Создание контент-плана</h1>
                <p className="mt-1 text-muted-foreground">
                    Настройте параметры и сгенерируйте контент-план с помощью AI
                </p>
            </div>

            <ContentPlanForm
                socialNetworks={socialNetworks}
                rubrics={rubrics.map((r) => ({
                    id: r.id,
                    name: r.name,
                    description: r.description,
                    postsPerMonth: r.postsPerMonth,
                    sortOrder: r.sortOrder,
                    isActive: r.isActive,
                }))}
            />
        </div>
    );
}
