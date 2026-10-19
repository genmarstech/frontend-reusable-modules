import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Genmars Commerce Platform",
  description: "Multi-tenant commerce platform frontend — foundation phase.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-neutral-50 text-neutral-900 antialiased">
        <header className="border-b border-neutral-200 bg-white px-6 py-4">
          <p className="text-sm font-semibold tracking-tight">Genmars Commerce Platform</p>
        </header>
        <main className="flex-1 px-6 py-10">{children}</main>
        <footer className="border-t border-neutral-200 px-6 py-4 text-xs text-neutral-400">
          {/* No new Date() here — Cache Components mode treats the current
             time as unstable sync IO during prerender and refuses to build
             the static shell around it (confirmed live: it broke every
             route's shell, not just this one, the first time this line
             read new Date().getFullYear()). A plain static string has
             nothing to go stale. */}
          © Genmars Tech Limited.
        </footer>
      </body>
    </html>
  );
}
