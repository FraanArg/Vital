"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Bot, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface Advice {
    icon: string;
    title: string;
    message: string;
    priority: "high" | "medium" | "low";
}

export default function AICoach() {
    const advice = useQuery(api.stats.getAICoachAdvice) as Advice[] | undefined;

    if (!advice || advice.length === 0) return null;

    const priorityStyles = {
        high: "from-red-500/10 to-red-500/5 border-red-500/20",
        medium: "from-yellow-500/10 to-yellow-500/5 border-yellow-500/20",
        low: "from-green-500/10 to-green-500/5 border-green-500/20",
    };

    const priorityIcons = {
        high: AlertTriangle,
        medium: Info,
        low: CheckCircle,
    };

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-primary/10">
                    <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold">AI Coach</h3>
                    <p className="text-xs text-muted-foreground">Personalized recommendations</p>
                </div>
            </div>

            <div className="space-y-3">
                {advice.map((item, index) => {
                    const PriorityIcon = priorityIcons[item.priority];
                    return (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative bg-gradient-to-r ${priorityStyles[item.priority]} border p-4 rounded-xl overflow-hidden`}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-2xl shrink-0">{item.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-sm">{item.title}</h4>
                                        <PriorityIcon className={`w-3 h-3 ${item.priority === "high" ? "text-red-500" :
                                                item.priority === "medium" ? "text-yellow-500" : "text-green-500"
                                            }`} />
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {item.message}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
