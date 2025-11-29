"use client";

import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../lib/db";
import { Search, Trash2, Utensils } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FoodDatabasePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const foods = useLiveQuery(async () => {
        return await db.foodItems.orderBy("usage_count").reverse().toArray();
    }, []);

    const filteredFoods = foods?.filter(food =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this food item?")) {
            await db.foodItems.delete(id);
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen p-4 sm:p-8 pb-24 flex flex-col items-center">
            <div className="w-full max-w-2xl animate-fade-in space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Food Database</h1>
                        <p className="text-muted-foreground mt-1">Manage your saved food items.</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-full">
                        <Utensils className="w-6 h-6 text-primary" />
                    </div>
                </header>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search foods..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 rounded-xl bg-card border border-border/50 focus:ring-2 focus:ring-primary shadow-sm"
                    />
                </div>

                <div className="grid gap-3">
                    <AnimatePresence mode="popLayout">
                        {filteredFoods?.map((food) => (
                            <motion.div
                                key={food.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-card p-4 rounded-xl shadow-sm border border-border/50 flex items-center justify-between group hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
                                        🍽️
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{food.name}</h3>
                                        <p className="text-xs text-muted-foreground">Used {food.usage_count} times</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => food.id && handleDelete(food.id)}
                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete Food"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredFoods?.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <p className="text-lg">No foods found.</p>
                            <p className="text-sm">Try adding some via the Food Tracker!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
