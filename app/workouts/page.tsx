"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RoutinesTab from "../../components/workouts/RoutinesTab";
import ExercisesTab from "../../components/workouts/ExercisesTab";
import SportsTab from "../../components/workouts/SportsTab";
import { PageHeader } from "../../components/ui/PageHeader";
import { SegmentedControl } from "../../components/ui/SegmentedControl";

export default function WorkoutsPage() {
    const [activeTab, setActiveTab] = useState<"routines" | "exercises" | "sports">("routines");

    return (
        <div className="page-padding container-mobile mx-auto">
            <PageHeader
                title="Workouts"
                subtitle="Manage your training"
            />

            {/* Tabs */}
            <div className="mb-6">
                <SegmentedControl
                    options={["routines", "exercises", "sports"]}
                    value={activeTab}
                    onChange={setActiveTab}
                    labels={{ routines: "Routines", exercises: "Exercises", sports: "Sports" }}
                    fullWidth
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === "routines" && <RoutinesTab />}
                    {activeTab === "exercises" && <ExercisesTab />}
                    {activeTab === "sports" && <SportsTab />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
