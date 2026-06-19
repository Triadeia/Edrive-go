import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
        display: ["var(--font-libre)", "Georgia", "serif"],
      },
      colors: {
        night: "#07070A",
        carbon: "#101014",
        graphite: "#19191F",
        electric: "#00C896",
        volt: "#FFD700",
        purple: "#6F35FF",
        mist: "#F5F5F7",
        asphalt: "#3A3A3A",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(0,200,150,.22), 0 24px 70px rgba(0,200,150,.2)",
        purple: "0 0 0 1px rgba(111,53,255,.25), 0 24px 80px rgba(111,53,255,.22)",
      },
    },
  },
  plugins: [],
};

export default config;
