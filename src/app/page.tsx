import { BookCard } from "@/components/BookCard";
import { supabase } from "@/lib/supabase";

// To make this page dynamic and fetch fresh data on every request (optional but good for an e-commerce catalog)
export const revalidate = 0;

export default async function Home() {
  // Obtener los libros desde Supabase
  const { data: books, error } = await supabase
    .from("libros")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching books:", error);
  }

  return (
    <div className="flex flex-col gap-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-primary/10 glass-card p-8 md:p-16 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-8 mt-4">
        <div className="max-w-2xl z-10">
          <h1 className="text-4xl md:text-6xl font-heading font-extrabold tracking-tight mb-6">
            Descubre tu próxima <span className="text-primary">gran aventura</span> literaria.
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-xl">
            Explora nuestra vasta colección de libros. Desde los clásicos eternos hasta los best-sellers más recientes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/30">
              Explorar Catálogo
            </button>
            <button className="bg-secondary/10 hover:bg-secondary/20 text-secondary font-semibold px-8 py-3 rounded-full transition-all hover:scale-105 active:scale-95 border border-secondary/20">
              Ver Ofertas
            </button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/3 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl -z-10" />
        <div className="absolute left-0 bottom-0 translate-y-1/3 -translate-x-1/3 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-3xl -z-10" />
      </section>

      {/* Featured Books Section */}
      <section className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-heading font-bold">Catálogo de Libros</h2>
          <span className="text-sm text-foreground/60">
            {books?.length || 0} disponibles
          </span>
        </div>
        
        {(!books || books.length === 0) ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-border border-dashed">
            <h3 className="text-xl font-semibold mb-2">Aún no hay libros</h3>
            <p className="text-foreground/60">Agrega libros desde el Panel Administrativo para verlos aquí.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                author={book.author}
                price={book.price}
                imageUrl={book.image_url || `https://placehold.co/400x600/6366f1/ffffff?text=${encodeURIComponent(book.title.substring(0, 15))}`}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
