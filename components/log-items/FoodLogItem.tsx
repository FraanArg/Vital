import { Doc } from "../../convex/_generated/dataModel";

interface FoodLogItemProps {
    log: Doc<"logs">;
}

export default function FoodLogItem({ log }: FoodLogItemProps) {
    if (log.meal) {
        const typeName = log.meal.type.charAt(0).toUpperCase() + log.meal.type.slice(1).replace('_', ' ');
        return (
            <div className="flex flex-col">
                <span className="font-semibold text-xs">{typeName}</span>
                <span className="text-[10px] text-muted-foreground line-clamp-1">{log.meal.items.join(", ")}</span>
            </div>
        );
    }
    return <span className="font-semibold text-xs">Food: {log.food}</span>;
}
