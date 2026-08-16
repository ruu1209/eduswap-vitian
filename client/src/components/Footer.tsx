export function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="container flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} EduSwap. Built for verified students.</p>
        <p className="font-mono text-xs">Notes · Books · Assignments</p>
      </div>
    </footer>
  );
}
