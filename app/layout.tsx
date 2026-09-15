import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Playful Loaders — React game loading states",
  description: "Four playful, accessible React loading components: Snake, Tetris, Pong, and Space Invaders.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
