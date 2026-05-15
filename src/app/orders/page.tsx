"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Package, Clock, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function OrdersPage() {
  interface OrderItem {
    quantity: number;
    price_at_purchase: number;
    libros: {
      title: string;
      image_url?: string;
      author: string;
    } | null;
  }

  interface Order {
    id: string;
    created_at: string;
    total_amount: number;
    status: string;
    compras_items: OrderItem[];
  }

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          window.location.href = "/login";
          return;
        }

        const { data, error } = await supabase
          .from("compras")
          .select(`
            id,
            created_at,
            total_amount,
            status,
            compras_items (
              quantity,
              price_at_purchase,
              libros (
                title,
                image_url,
                author
              )
            )
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setOrders((data as unknown as Order[]) || []);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Package className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Mis Pedidos
        </h1>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 text-red-500 px-4 py-3 rounded-lg border border-red-500/20">
          Error al cargar los pedidos: {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center flex flex-col items-center">
          <BookOpen className="h-16 w-16 text-foreground/20 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Aún no tienes pedidos</h2>
          <p className="text-foreground/60 mb-6">Explora nuestro catálogo y descubre tu próxima lectura.</p>
          <Link href="/" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/30">
            Ir al Catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="glass-card rounded-2xl overflow-hidden border border-border">
              {/* Header de la Orden */}
              <div className="bg-muted/30 p-4 border-b border-border flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex flex-col gap-1 text-sm">
                  <span className="text-foreground/60 flex items-center gap-1">
                    <Clock className="h-4 w-4" /> 
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                  <span className="font-mono text-xs text-foreground/40">ID: {order.id}</span>
                </div>
                <div className="flex flex-col sm:items-end gap-1 text-sm">
                  <span className="font-bold text-lg text-primary">
                    ${order.total_amount.toFixed(2)}
                  </span>
                  <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider inline-block">
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items de la Orden */}
              <div className="p-4 space-y-4">
                {order.compras_items.map((item, index) => {
                  const book = item.libros;
                  return (
                    <div key={index} className="flex gap-4 items-center">
                      <div className="relative h-16 w-12 bg-muted rounded overflow-hidden flex-shrink-0">
                        {book?.image_url && (
                          <Image 
                            src={book.image_url} 
                            alt={book?.title || "Libro"} 
                            fill 
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm sm:text-base line-clamp-1">
                          {book?.title || "Libro no disponible"}
                        </h4>
                        <p className="text-xs text-foreground/60">{book?.author || ""}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium">${item.price_at_purchase.toFixed(2)}</p>
                        <p className="text-foreground/60">Cant: {item.quantity}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
