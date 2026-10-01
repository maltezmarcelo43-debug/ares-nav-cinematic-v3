import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARES NAV · Mars Exploration Navigation",
  description:
    "Cinematic Mars mission-planning experience built with NASA imagery and 3D assets.",
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
