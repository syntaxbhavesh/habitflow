import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "HabitFlow AI — Build better days", description: "A thoughtful habit tracker with an AI-powered progress coach." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
