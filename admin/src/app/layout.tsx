import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  icons: { icon: "/assets/shams/brand/shams-logo.png" },
  title: "Sham's Chai | Executive Admin & Operations",
  description: "Executive control panel for Sham's Chai - Manage menu pricing, view live customer orders, verify payment settlements, and monitor store analytics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#faf7f1] text-[#171815] antialiased selection:bg-[#17382f] selection:text-[#faf7f1]">
        {children}
      </body>
    </html>
  );
}
