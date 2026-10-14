import { MpesaBadge } from "./MpesaBadge";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-bg">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>&copy; {new Date().getFullYear()} Genmars Store. All rights reserved.</p>
        <MpesaBadge label="Secure checkout with M-Pesa" />
      </div>
    </footer>
  );
}
