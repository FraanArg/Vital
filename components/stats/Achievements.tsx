"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";

export default function Achievements() {
    const data = useQuery(api.stats.getAchievements);

    if (!data || data.length === 0) return null;

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
            <h3 className="font-semibold mb-4">Achievements</h3>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {data.map((achievement, i) => (
                    <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="text-center p-3 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl"
                        title={achievement.desc}
                    >
                        <div className="text-3xl mb-1">{achievement.icon}</div>
                        <div className="text-xs font-medium leading-tight">{achievement.name}</div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
