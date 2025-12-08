/**
 * Food Nutrient Categorization
 * Maps foods to general nutrient categories for AI analysis
 * Uses general categories (not exact macros) as per user preference
 */

export type NutrientCategory = "Protein" | "Carbs" | "Veggies" | "Fruits" | "Fats" | "Sweets" | "Hydration" | "Dairy" | "Other";

/**
 * Keywords mapped to nutrient categories
 * Includes English and Spanish keywords
 */
export const NUTRIENT_KEYWORDS: Record<NutrientCategory, string[]> = {
    Protein: [
        // Meats
        "chicken", "pollo", "beef", "carne", "steak", "bife", "pork", "cerdo", "turkey", "pavo",
        "lamb", "cordero", "bacon", "panceta", "ham", "jamon", "jamón", "sausage", "salchicha",
        // Fish & Seafood
        "fish", "pescado", "salmon", "salmón", "tuna", "atun", "atún", "shrimp", "camarón", "camaron",
        "lobster", "langosta", "crab", "cangrejo", "squid", "calamar", "oyster", "ostra",
        // Eggs
        "egg", "huevo", "omelette", "omelet", "tortilla",
        // Plant proteins
        "tofu", "tempeh", "seitan", "beans", "porotos", "frijoles", "lentils", "lentejas",
        "chickpeas", "garbanzos", "edamame", "protein", "proteina", "proteína",
    ],
    Carbs: [
        // Grains
        "rice", "arroz", "bread", "pan", "pasta", "fideos", "noodles", "spaghetti",
        "oats", "avena", "cereal", "quinoa", "couscous",
        // Starchy
        "potato", "papa", "patata", "sweet potato", "batata", "corn", "maiz", "maíz", "choclo",
        // Baked goods
        "toast", "tostada", "bagel", "croissant", "medialuna", "tortilla", "arepa",
        "pancake", "panqueque", "waffle", "pizza", "burger", "hamburguesa", "sandwich", "sanguche",
        "fries", "papas fritas", "empanada", "taco", "burrito",
    ],
    Veggies: [
        "salad", "ensalada", "broccoli", "brocoli", "brócoli", "spinach", "espinaca",
        "carrot", "zanahoria", "tomato", "tomate", "cucumber", "pepino", "lettuce", "lechuga",
        "pepper", "pimiento", "morron", "morrón", "onion", "cebolla", "garlic", "ajo",
        "mushroom", "hongo", "champiñon", "zucchini", "calabacin", "eggplant", "berenjena",
        "celery", "apio", "asparagus", "espárrago", "cauliflower", "coliflor", "kale", "acelga",
        "cabbage", "repollo", "green beans", "judias", "peas", "arvejas", "guisantes",
    ],
    Fruits: [
        "apple", "manzana", "banana", "plátano", "platano", "orange", "naranja",
        "strawberry", "fresa", "frutilla", "blueberry", "arandano", "arándano",
        "mango", "grape", "uva", "watermelon", "sandia", "sandía", "melon", "melón",
        "pineapple", "piña", "anana", "kiwi", "peach", "durazno", "pear", "pera",
        "cherry", "cereza", "raspberry", "frambuesa", "blackberry", "mora",
        "papaya", "coconut", "coco", "lemon", "limon", "limón", "lime", "lima",
    ],
    Fats: [
        "avocado", "palta", "aguacate", "nuts", "nueces", "almonds", "almendras",
        "peanut", "mani", "maní", "cacahuate", "walnut", "olive oil", "aceite",
        "butter", "manteca", "mantequilla", "coconut oil", "cream", "crema",
        "cheese", "queso", "chia", "flaxseed", "linaza", "seeds", "semillas",
    ],
    Sweets: [
        "chocolate", "ice cream", "helado", "cake", "torta", "pastel", "cookie", "galleta",
        "candy", "caramelo", "donut", "dona", "pastry", "factura", "pie", "tarta",
        "brownie", "cupcake", "muffin", "cheesecake", "flan", "pudding", "dulce",
        "sugar", "azucar", "azúcar", "honey", "miel", "jam", "mermelada",
    ],
    Hydration: [
        "water", "agua", "tea", "té", "coffee", "cafe", "café", "juice", "jugo",
        "smoothie", "licuado", "mate", "soda", "gaseosa", "lemonade", "limonada",
        "sparkling", "mineral",
    ],
    Dairy: [
        "milk", "leche", "yogurt", "yogur", "cheese", "queso", "cream", "crema",
        "butter", "manteca", "ice cream", "helado",
    ],
    Other: [],
};

/**
 * Categorize a food item by its primary nutrient
 */
export function categorizeByNutrient(item: string): NutrientCategory {
    const lowerItem = item.toLowerCase().trim();

    for (const [category, keywords] of Object.entries(NUTRIENT_KEYWORDS) as [NutrientCategory, string[]][]) {
        if (category === "Other") continue;
        for (const keyword of keywords) {
            if (lowerItem.includes(keyword)) {
                return category;
            }
        }
    }

    return "Other";
}

/**
 * Get all nutrient categories for a food item (some foods have multiple)
 * e.g., "cheese" is both Protein and Fats
 */
export function getAllNutrients(item: string): NutrientCategory[] {
    const lowerItem = item.toLowerCase().trim();
    const categories: NutrientCategory[] = [];

    for (const [category, keywords] of Object.entries(NUTRIENT_KEYWORDS) as [NutrientCategory, string[]][]) {
        if (category === "Other") continue;
        for (const keyword of keywords) {
            if (lowerItem.includes(keyword) && !categories.includes(category)) {
                categories.push(category);
                break;
            }
        }
    }

    return categories.length > 0 ? categories : ["Other"];
}

/**
 * Parse a meal description into individual ingredients
 * e.g., "chicken salad with avocado" → ["chicken", "salad", "avocado"]
 */
export function parseIngredients(text: string): string[] {
    // Common separators and connectors to split on
    const separators = /[,;+&]|\band\b|\bwith\b|\by\b|\bcon\b/gi;

    return text
        .split(separators)
        .map(item => item.trim())
        .filter(item => item.length > 0 && item.length < 50); // Filter out empty or too long items
}

/**
 * Analyze a list of food items and return nutrient distribution
 */
export function analyzeNutrients(items: string[]): Record<NutrientCategory, number> {
    const counts: Record<NutrientCategory, number> = {
        Protein: 0,
        Carbs: 0,
        Veggies: 0,
        Fruits: 0,
        Fats: 0,
        Sweets: 0,
        Hydration: 0,
        Dairy: 0,
        Other: 0,
    };

    for (const item of items) {
        const categories = getAllNutrients(item);
        for (const category of categories) {
            counts[category]++;
        }
    }

    return counts;
}

/**
 * Get emoji for nutrient category
 */
export function getNutrientEmoji(category: NutrientCategory): string {
    const emojis: Record<NutrientCategory, string> = {
        Protein: "🥩",
        Carbs: "🍞",
        Veggies: "🥬",
        Fruits: "🍎",
        Fats: "🥑",
        Sweets: "🍫",
        Hydration: "💧",
        Dairy: "🥛",
        Other: "🍽️",
    };
    return emojis[category];
}

/**
 * Get color for nutrient category (for UI)
 */
export function getNutrientColor(category: NutrientCategory): string {
    const colors: Record<NutrientCategory, string> = {
        Protein: "text-red-500",
        Carbs: "text-yellow-500",
        Veggies: "text-green-500",
        Fruits: "text-purple-500",
        Fats: "text-orange-500",
        Sweets: "text-pink-500",
        Hydration: "text-blue-500",
        Dairy: "text-cyan-500",
        Other: "text-gray-500",
    };
    return colors[category];
}
