import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HackJudge AI",
  description: "Autonomous Hackathon Review Agent - Get instant, holistic feedback on your hackathon projects.",
  keywords: ["hackathon", "AI", "code review", "judge", "evaluation"],
  authors: [{ name: "HackJudge AI Team" }],
  openGraph: {
    title: "HackJudge AI - Autonomous Hackathon Review Agent",
    description: "Get instant, AI-powered feedback on code quality, UX, performance, and more.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload Departure Mono font if available */}
        <link
          rel="preload"
          href="/fonts/DepartureMono-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
