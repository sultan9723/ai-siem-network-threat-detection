import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "AI SIEM Dashboard",
  description: "Enterprise Network Threat Detection & Analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <Toaster position="top-right" />
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-y-auto bg-slate-950 p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
