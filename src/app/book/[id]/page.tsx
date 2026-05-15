"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { ShoppingCart, ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

export default function BookDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  interface Book {
    id: string;
    title: string;
    author: string;
    description?: string;
    price: number;
    stock: number;
    image_url?: string;
  }

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    async function fetchBook() {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from("libros")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setBook(data);
      } catch (error) {
        console.error("Error fetching book:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <BookOpen className="h-16 w-16 text-foreground/20 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Libro no encontrado</h1>
        <Link href="/" className="text-primary hover:underline flex items-center justify-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver al catálogo
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: book.id,
      title: book.title,
      price: book.price,
      imageUrl: book.image_url || `https://placehold.co/400x600/6366f1/ffffff?text=${encodeURIComponent(book.title.substring(0, 15))}`,
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <Link href="/" className="inline-flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors mb-8">
        <ArrowLeft className="h-4 w-4" /> Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Imagen */}
        <div className="relative aspect-[2/3] w-full max-w-md mx-auto md:mx-0 rounded-2xl overflow-hidden glass-card">
          <Image
            src={book.image_url || `https://placehold.co/800x1200/6366f1/ffffff?text=${encodeURIComponent(book.title)}`}
            alt={book.title}
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Detalles */}
        <div className="flex flex-col">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-2">{book.title}</h1>
            <p className="text-xl text-foreground/70 font-medium">{book.author}</p>
          </div>

          <div className="flex items-end gap-4 mb-8 border-b border-border pb-8">
            <span className="text-4xl font-bold text-primary">${book.price.toFixed(2)}</span>
            <span className="text-sm font-medium px-3 py-1 bg-secondary/20 text-secondary rounded-full mb-1">
              {book.stock > 0 ? `${book.stock} en stock` : 'Agotado'}
            </span>
          </div>

          <div className="prose prose-sm sm:prose-base dark:prose-invert mb-8 flex-1">
            <h3 className="text-lg font-semibold mb-2">Descripción</h3>
            <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {book.description || "No hay descripción disponible para este libro."}
            </p>
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={book.stock === 0}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-xl shadow-primary/20"
          >
            <ShoppingCart className="h-6 w-6" />
            {book.stock === 0 ? "Agotado" : "Añadir al Carrito"}
          </button>
        </div>
      </div>
    </div>
  );
}
