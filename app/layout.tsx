import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import AssistantDialog from "@/components/assistant-dialog";
import "./globals.css";

export const metadata: Metadata = {
  title: "SETUVA — AI-Powered Government Application Companion",
  description:
    "Discover verified government schemes, understand published eligibility criteria, prepare document checklists, and track preparation progress with grounded official citations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-[#0a0a0b]" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#0a0a0b] text-[#f4e8d7] antialiased">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <AssistantDialog />
      </body>
    </html>
  );
}
