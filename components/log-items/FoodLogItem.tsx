import { Doc } from "../../convex/_generated/dataModel";

interface FoodLogItemProps {
    log: Doc<"logs">;
}

export default function FoodLogItem({ log }: FoodLogItemProps) {
    if (log.meal) {
        const typeName = log.meal.type.charAt(0).toUpperCase() + log.meal.type.slice(1).replace('_', ' ');
        return (
            <div className="flex flex-col">
                <span className="font-semibold text-sm flex items-center gap-2">
                    {typeName} <span className="text-xs text-muted font-normal">{log.meal.time}</span>
                </span>
                <span className="text-xs text-muted-foreground">{log.meal.items.join(", ")}</span>
            </div>
        );
    }
    return <span>Food: {log.food}</span>;
}
