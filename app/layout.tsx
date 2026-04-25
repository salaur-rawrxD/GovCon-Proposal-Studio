import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TopBar } from "@/components/shell/TopBar";
import { ProjectDataProvider } from "@/contexts/ProjectDataContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GovCon Proposal Studio",
  description: "Upload RFPs, align capabilities, and get a structured proposal—one calm, focused workflow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col">
        <ProjectDataProvider>
          <TopBar />
          {children}
        </ProjectDataProvider>
      </body>
    </html>
  );
}
