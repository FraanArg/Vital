import { Doc } from "../../convex/_generated/dataModel";

interface FoodLogItemProps {
    log: Doc<"logs">;
}

export default function FoodLogItem({ log }: FoodLogItemProps) {
    if (log.meal) {
        const typeName = log.meal.type.charAt(0).toUpperCase() + log.meal.type.slice(1).replace('_', ' ');
        const items = log.meal.items.join(", ");
        return <span>{typeName}: {items}</span>;
    }
    return <span>Food: {log.food}</span>;
}
