import type { Metadata } from "next";
import "./globals.css"; 

export const metadata: Metadata = {
  title: "NexusLink",
  description: "Shorten your URLs instantly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* The Magic Bullet: Bypassing local files and loading Tailwind from the Cloud */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-gray-900">{children}</body>
    </html>
  );
}