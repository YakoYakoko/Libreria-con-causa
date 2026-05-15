"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { BookPlus, CheckCircle2, Pencil, Trash2, X, Search } from "lucide-react";
import Image from "next/image";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // State for books listing
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  interface Book {
    id: string;
    title: string;
    author: string;
    description?: string;
    price: number;
    stock: number;
    image_url?: string;
    created_at?: string;
  }

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    price: "",
    stock: "",
    image_url: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login");
      }
      setIsCheckingAuth(false);
      fetchBooks();
    });
  }, [router]);

  async function fetchBooks() {
    const { data, error } = await supabase
      .from("libros")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setBooks(data);
    if (error) console.error("Error fetching books:", error);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEdit = (book: Book) => {
    setEditingId(book.id);
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description || "",
      price: book.price.toString(),
      stock: book.stock.toString(),
      image_url: book.image_url || "",
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: "",
      author: "",
      description: "",
      price: "",
      stock: "",
      image_url: "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este libro?")) return;
    
    const { error } = await supabase.from("libros").delete().eq("id", id);
    if (error) {
      alert("Error al eliminar: " + error.message);
    } else {
      fetchBooks();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const bookData = {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        image_url: formData.image_url || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from("libros")
          .update(bookData)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("libros").insert([bookData]);
        if (error) throw error;
      }

      setSuccess(true);
      cancelEdit();
      fetchBooks();
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al procesar el libro.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isCheckingAuth) {
    return <div className="flex-1 flex justify-center items-center py-20">Cargando...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-12">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BookPlus className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Panel Administrativo
          </h1>
        </div>
      </div>

      {/* Formulario */}
      <div className="glass-card p-8 rounded-2xl">
        <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
          <h2 className="text-xl font-semibold">
            {editingId ? "Editar Libro" : "Subir Nuevo Libro"}
          </h2>
          {editingId && (
            <button 
              onClick={cancelEdit}
              className="flex items-center gap-1 text-sm text-foreground/50 hover:text-red-500 transition-colors"
            >
              <X className="h-4 w-4" /> Cancelar Edición
            </button>
          )}
        </div>

        {success && (
          <div className="mb-6 flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-3 rounded-lg border border-green-500/20">
            <CheckCircle2 className="h-5 w-5" />
            <p className="font-medium">¡Operación completada exitosamente!</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-500/10 text-red-500 px-4 py-3 rounded-lg border border-red-500/20 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Título *</label>
              <input
                required
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-background/50 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="Ej. 1984"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Autor *</label>
              <input
                required
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-background/50 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="Ej. George Orwell"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Precio (USD) *</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-background/50 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="Ej. 19.99"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Stock (Unidades) *</label>
              <input
                required
                type="number"
                min="0"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-background/50 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="Ej. 50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL de la Imagen</label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-background/50 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="https://ejemplo.com/portada.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-border bg-background/50 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-y"
              placeholder="Escribe una breve sinopsis del libro..."
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              {loading ? "Procesando..." : editingId ? "Actualizar Libro" : "Guardar Libro"}
            </button>
          </div>
        </form>
      </div>

      {/* Listado de Libros */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold font-heading">Inventario Actual</h2>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
            <input 
              type="text" 
              placeholder="Buscar por título o autor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-border bg-background/50 focus:border-primary outline-none text-sm transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredBooks.length === 0 ? (
            <p className="text-center py-10 text-foreground/50 border border-dashed border-border rounded-xl">
              No se encontraron libros.
            </p>
          ) : (
            filteredBooks.map((book) => (
              <div key={book.id} className="glass-card p-4 rounded-xl flex items-center gap-6 group hover:border-primary/30 transition-all">
                <div className="relative h-20 w-14 bg-muted rounded overflow-hidden flex-shrink-0">
                  <Image 
                    src={book.image_url || `https://placehold.co/400x600/6366f1/ffffff?text=${encodeURIComponent(book.title.substring(0, 1))}`} 
                    alt={book.title} 
                    fill 
                    className="object-contain"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{book.title}</h3>
                  <p className="text-sm text-foreground/60 truncate">{book.author}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-primary font-bold">${book.price.toFixed(2)}</span>
                    <span className="text-xs text-foreground/40">Stock: {book.stock}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEdit(book)}
                    className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(book.id)}
                    className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

