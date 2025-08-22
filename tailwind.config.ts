import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom theme colors for direct usage
        gold: {
          50: '#fefcf0',
          100: '#fef7e0',
          200: '#fdecc4',
          300: '#f9d99c',
          400: '#f4c150',
          500: '#D4AF37', // Primary gold
          600: '#c9a023',
          700: '#a67c1a',
          800: '#89651a',
          900: '#72531b',
        },
        green: {
          50: '#f1f8f2',
          100: '#e0ede1',
          200: '#c3dcc6',
          300: '#98c29e',
          400: '#7BAE7F', // Secondary green
          500: '#569760',
          600: '#42794c',
          700: '#35603e',
          800: '#2d4e34',
          900: '#25412b',
        },
        terracotta: {
          50: '#fef5f0',
          100: '#fde8dc',
          200: '#fadfc9',
          300: '#f7c59b',
          400: '#f39a5b',
          500: '#D88245', // Accent terracotta
          600: '#c66a2b',
          700: '#a75424',
          800: '#864424',
          900: '#6e3920',
        },
        cream: {
          50: '#ffffff',
          100: '#fefefe',
          200: '#fdfdfd',
          300: '#fbfbfb',
          400: '#f8f8f8',
          500: '#F5F0E6', // Secondary background
          600: '#e8ddd0',
          700: '#d4c4ad',
          800: '#b8a284',
          900: '#9b856a',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
