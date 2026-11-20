import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteSidebar } from "@/components/site-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toast";
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
  title: {
    default: "MentorLagbe – Find Your Perfect Mentor",
    template: "%s | MentorLagbe",
  },
  description:
    "MentorLagbe is a role-based tuition management platform connecting verified tutors with students for subject-wise batches and 1-on-1 mentorship, online and offline.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full">
        {/* Left menubar (desktop) + right-hand shell. SidebarProvider owns
            the flex row so the fixed sidebar's gap stays in normal flow. */}
        <SidebarProvider>
          <SiteSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </SidebarProvider>
        {/* Global toast viewport — sign-in/sign-up validation and API errors
            surface here via `toast.add({ type: "error", … })`. */}
        <Toaster />
      </body>
    </html>
  );
}
