export function Footer() {
  return (
    <footer className="mt-auto py-8 glass border-t border-border">
      <div className="container mx-auto px-4 text-center text-sm text-foreground/60">
        <p>&copy; {new Date().getFullYear()} Librería con Causa. Todos los derechos reservados.</p>
        <p className="mt-2">Built with Next.js, Tailwind CSS, and Supabase.</p>
      </div>
    </footer>
  );
}
