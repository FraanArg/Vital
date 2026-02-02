import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./features/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                card: "var(--card)",
                "card-foreground": "var(--card-foreground)",
                primary: "var(--primary)",
                "primary-foreground": "var(--primary-foreground)",
                secondary: "var(--secondary)",
                "secondary-foreground": "var(--secondary-foreground)",
                muted: "var(--muted)",
                "muted-foreground": "var(--muted-foreground)",
                border: "var(--border)",
                input: "var(--input)",
                ring: "var(--ring)",
                destructive: "var(--destructive)",
                separator: "var(--separator)",
                // Tracker category colors
                "tracker-food": "var(--color-food)",
                "tracker-exercise": "var(--color-exercise)",
                "tracker-water": "var(--color-water)",
                "tracker-sleep": "var(--color-sleep)",
                "tracker-mood": "var(--color-mood)",
                "tracker-work": "var(--color-work)",
            },
            borderRadius: {
                sm: "var(--radius-sm)",
                md: "var(--radius-md)",
                lg: "var(--radius-lg)",
                xl: "var(--radius-xl)",
                "2xl": "var(--radius-2xl)",
            },
            fontSize: {
                xs: "var(--text-xs)",
                sm: "var(--text-sm)",
                base: "var(--text-base)",
                lg: "var(--text-lg)",
                xl: "var(--text-xl)",
                "2xl": "var(--text-2xl)",
                "3xl": "var(--text-3xl)",
                "4xl": "var(--text-4xl)",
            },
            boxShadow: {
                sm: "var(--shadow-sm)",
                DEFAULT: "var(--shadow)",
                md: "var(--shadow-md)",
                lg: "var(--shadow-lg)",
            },
            transitionDuration: {
                fast: "var(--duration-fast)",
                normal: "var(--duration-normal)",
                slow: "var(--duration-slow)",
            },
            transitionTimingFunction: {
                out: "var(--ease-out)",
                spring: "var(--ease-spring)",
            },
            spacing: {
                // 8pt grid system
                "0": "var(--space-0)",
                "1": "var(--space-1)",
                "2": "var(--space-2)",
                "3": "var(--space-3)",
                "4": "var(--space-4)",
                "5": "var(--space-5)",
                "6": "var(--space-6)",
                "8": "var(--space-8)",
                "10": "var(--space-10)",
                "12": "var(--space-12)",
                "16": "var(--space-16)",
            },
            maxWidth: {
                // Standard container widths
                "container-sm": "640px",
                "container-md": "768px",
                "container-lg": "1024px",
                "container-xl": "1280px",
                "container": "1200px", // Default app container
            },
            animation: {
                "slide-up": "slideUp 0.2s var(--ease-spring) forwards",
                "fade-in": "fadeIn 0.15s var(--ease-out) forwards",
                "scale-in": "scaleIn 0.2s var(--ease-spring) forwards",
            },
            keyframes: {
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                scaleIn: {
                    "0%": { opacity: "0", transform: "scale(0.95)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
            },
        },
    },
    plugins: [],
};
export default config;
