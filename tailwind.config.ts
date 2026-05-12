import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-muted": "var(--surface-muted)",
        "text-main": "var(--text-main)",
        "text-muted": "var(--text-muted)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        destructive: "var(--destructive)",
        success: "var(--success)",
        warning: "var(--warning)",
        info: "var(--info)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        modal: "var(--shadow-modal)",
      },
    },
  },
};

export default config;
