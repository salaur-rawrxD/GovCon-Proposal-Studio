import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { CommandAppShell } from "@/components/shell/CommandAppShell";
import { CompanyProfileProvider } from "@/contexts/CompanyProfileContext";
import { ProjectDataProvider } from "@/contexts/ProjectDataContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
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
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh">
        <ProjectDataProvider>
          <CompanyProfileProvider>
            <CommandAppShell>{children}</CommandAppShell>
          </CompanyProfileProvider>
        </ProjectDataProvider>
      </body>
    </html>
  );
}
