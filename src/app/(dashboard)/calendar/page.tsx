import { getSocialNetworks } from "@/actions/content-plan";
import { CalendarView } from "@/components/calendar/calendar-view";

export default async function CalendarPage() {
    const socialNetworks = await getSocialNetworks();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Контент-календарь</h1>
                <p className="mt-1 text-muted-foreground">
                    Просматривайте и редактируйте посты в календаре
                </p>
            </div>

            <CalendarView socialNetworks={socialNetworks} />
        </div>
    );
}
