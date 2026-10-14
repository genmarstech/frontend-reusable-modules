export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-text-muted sm:px-6">
        <p>&copy; {new Date().getFullYear()} Genmars Store. All rights reserved.</p>
      </div>
    </footer>
  );
}
