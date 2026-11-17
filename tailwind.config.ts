import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { ink: "#17221d", muted: "#748078", canvas: "#f6f8f5", leaf: "#3d7959" }, boxShadow: { soft: "0 12px 40px rgba(24,42,31,.07)" } } },
  plugins: []
};
export default config;
