import type { Config } from "tailwindcss";

// Palette de marque "Creatine Senegal" :
// - fond profond charbon (asphalte de salle de sport)
// - accent signature : orange-braise (chaleur, énergie, effort)
// - accent secondaire : bleu cobalt (précision, dosage, confiance clinique)
// - sable chaud pour les surfaces claires (climat sahélien)
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        charbon: {
          DEFAULT: "#15181B",
          soft: "#1E2225",
          line: "#2A2F33",
        },
        braise: {
          DEFAULT: "#FF5A1F",
          dim: "#CC4718",
          light: "#FF8A5C",
        },
        cobalt: {
          DEFAULT: "#2955F0",
          dim: "#1E3FB8",
        },
        sable: {
          DEFAULT: "#EFE7D8",
          dark: "#DCD0B6",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "4px",
      },
    },
  },
  plugins: [],
};

export default config;
