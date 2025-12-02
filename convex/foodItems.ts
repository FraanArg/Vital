import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        const userId = identity.subject;

        const systemFoods = await ctx.db
            .query("foodItems")
            .filter(q => q.eq(q.field("userId"), undefined))
            .collect();

        const userFoods = await ctx.db
            .query("foodItems")
            .withIndex("by_user_name", (q) => q.eq("userId", userId))
            .collect();

        return [...systemFoods, ...userFoods].sort((a, b) => b.usage_count - a.usage_count);
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        icon: v.optional(v.string()),
        category: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");
        const userId = identity.subject;

        const existing = await ctx.db
            .query("foodItems")
            .withIndex("by_user_name", (q) => q.eq("userId", userId).eq("name", args.name))
            .first();

        if (existing) return existing._id;

        return await ctx.db.insert("foodItems", {
            userId,
            name: args.name,
            usage_count: 1,
            icon: args.icon,
            category: args.category,
        });
    },
});

export const incrementUsage = mutation({
    args: { id: v.id("foodItems") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const item = await ctx.db.get(args.id);
        if (!item) return;

        await ctx.db.patch(args.id, {
            usage_count: (item.usage_count || 0) + 1,
        });
    },
});

export const remove = mutation({
    args: { id: v.id("foodItems") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        // Only allow deleting user's own items
        const item = await ctx.db.get(args.id);
        if (!item || item.userId !== identity.subject) return;

        await ctx.db.delete(args.id);
    },
});

export const seedDefaults = mutation({
    args: {},
    handler: async (ctx) => {
        const defaults = [
            // Proteins
            { name: "Chicken Breast", category: "Protein", icon: "🍗" },
            { name: "Steak", category: "Protein", icon: "🥩" },
            { name: "Salmon", category: "Protein", icon: "🐟" },
            { name: "Tuna", category: "Protein", icon: "🐟" },
            { name: "Eggs", category: "Protein", icon: "🥚" },
            { name: "Egg Whites", category: "Protein", icon: "🥚" },
            { name: "Greek Yogurt", category: "Protein", icon: "🥣" },
            { name: "Cottage Cheese", category: "Protein", icon: "🧀" },
            { name: "Tofu", category: "Protein", icon: "🧊" },
            { name: "Protein Powder", category: "Protein", icon: "🥤" },

            // Carbs
            { name: "Rice", category: "Carb", icon: "🍚" },
            { name: "Oats", category: "Carb", icon: "🥣" },
            { name: "Pasta", category: "Carb", icon: "🍝" },
            { name: "Potato", category: "Carb", icon: "🥔" },
            { name: "Sweet Potato", category: "Carb", icon: "🍠" },
            { name: "Bread", category: "Carb", icon: "🍞" },
            { name: "Quinoa", category: "Carb", icon: "🌾" },
            { name: "Banana", category: "Fruit", icon: "🍌" },
            { name: "Apple", category: "Fruit", icon: "🍎" },
            { name: "Berries", category: "Fruit", icon: "🫐" },

            // Veggies
            { name: "Broccoli", category: "Veggie", icon: "🥦" },
            { name: "Spinach", category: "Veggie", icon: "🍃" },
            { name: "Asparagus", category: "Veggie", icon: "🎋" },
            { name: "Carrots", category: "Veggie", icon: "🥕" },
            { name: "Cucumber", category: "Veggie", icon: "🥒" },
            { name: "Tomato", category: "Veggie", icon: "🍅" },
            { name: "Peppers", category: "Veggie", icon: "🫑" },
            { name: "Onion", category: "Veggie", icon: "🧅" },

            // Fats
            { name: "Avocado", category: "Fat", icon: "🥑" },
            { name: "Nuts", category: "Fat", icon: "🥜" },
            { name: "Peanut Butter", category: "Fat", icon: "🥜" },
            { name: "Olive Oil", category: "Fat", icon: "🫒" },
            { name: "Cheese", category: "Fat", icon: "🧀" },

            // Drinks
            { name: "Water", category: "Drink", icon: "💧" },
            { name: "Coffee", category: "Drink", icon: "☕" },
            { name: "Tea", category: "Drink", icon: "🍵" },
            { name: "Milk", category: "Drink", icon: "🥛" },

            // Sweets/Other
            { name: "Chocolate", category: "Sweet", icon: "🍫" },
            { name: "Cookie", category: "Sweet", icon: "🍪" },
            { name: "Ice Cream", category: "Sweet", icon: "🍦" },
            { name: "Pizza", category: "Other", icon: "🍕" },
            { name: "Burger", category: "Other", icon: "🍔" },
        ];

        const existingSystemFoods = await ctx.db
            .query("foodItems")
            .filter(q => q.eq(q.field("userId"), undefined))
            .collect();

        const existingNames = new Set(existingSystemFoods.map(f => f.name));

        let addedCount = 0;
        for (const food of defaults) {
            if (!existingNames.has(food.name)) {
                await ctx.db.insert("foodItems", {
                    ...food,
                    usage_count: 0,
                });
                addedCount++;
            }
        }

        return "Seeded " + addedCount + " new foods";
    },
});
