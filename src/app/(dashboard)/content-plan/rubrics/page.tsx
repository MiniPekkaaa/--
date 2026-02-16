import { getRubrics } from "@/actions/rubrics";
import { RubricsManager } from "@/components/content-plan/rubrics-manager";

export default async function RubricsPage() {
    const rubrics = await getRubrics();

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Управление рубриками</h1>
                <p className="mt-1 text-muted-foreground">
                    Настройте рубрики для ваших контент-планов
                </p>
            </div>

            <RubricsManager
                initialRubrics={rubrics.map((r) => ({
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
