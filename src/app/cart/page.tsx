"use client";

import { useCartStore } from "@/store/cartStore";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Usando un pequeño timeout o simplemente ignorando la regla para este patrón de hidratación necesario en Next.js
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    
    try {
      // Verificar si hay usuario
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert("Por favor inicia sesión para completar tu compra.");
        router.push("/login");
        return;
      }

      // 1. Crear el registro en "compras"
      const totalAmount = getTotalPrice();
      const { data: compra, error: compraError } = await supabase
        .from("compras")
        .insert([{ user_id: session.user.id, total_amount: totalAmount, status: "completed" }])
        .select()
        .single();

      if (compraError) throw compraError;

      // 2. Insertar los items de la compra
      const comprasItemsData = items.map((item) => ({
        compra_id: compra.id,
        libro_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("compras_items")
        .insert(comprasItemsData);

      if (itemsError) throw itemsError;

      // 3. Actualizar el stock
      // En un entorno real idealmente se haría vía una base de datos o RPC para asegurar atomicidad.
      for (const item of items) {
        // Obtenemos el stock actual (esto podría ser inseguro bajo alta concurrencia, pero sirve para la MVP)
        const { data: book } = await supabase
          .from("libros")
          .select("stock")
          .eq("id", item.id)
          .single();
          
        if (book) {
          await supabase
            .from("libros")
            .update({ stock: Math.max(0, book.stock - item.quantity) })
            .eq("id", item.id);
        }
      }

      // Éxito
      alert("¡Compra completada con éxito!");
      clearCart();
      router.push("/orders");

    } catch (error: unknown) {
      console.error("Error durante el checkout:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      alert("Hubo un error al procesar tu compra. " + errorMessage);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingBag className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Tu Carrito
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center flex flex-col items-center">
          <ShoppingBag className="h-16 w-16 text-foreground/20 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Tu carrito está vacío</h2>
          <p className="text-foreground/60 mb-6">Parece que aún no has agregado ningún libro a tu carrito.</p>
          <Link href="/" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/30">
            Explorar Catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-6">
                <div className="relative h-32 w-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  <Image 
                    src={item.imageUrl} 
                    alt={item.title} 
                    fill 
                    className="object-cover"
                  />
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-heading font-semibold text-lg line-clamp-1">{item.title}</h3>
                  <p className="font-bold text-primary text-xl mt-2">${item.price.toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-4 bg-background/50 p-2 rounded-full border border-border">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 hover:bg-foreground/5 rounded-full transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 hover:bg-foreground/5 rounded-full transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button 
                  onClick={() => removeItem(item.id)}
                  className="p-3 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Resumen de Orden */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 rounded-2xl sticky top-24">
              <h3 className="font-heading font-bold text-xl mb-6 border-b border-border pb-4">
                Resumen de Compra
              </h3>
              
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/70">Subtotal</span>
                  <span className="font-medium">${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Envío</span>
                  <span className="font-medium text-green-500">Gratis</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center border-t border-border pt-4 mb-8">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-2xl text-primary">${getTotalPrice().toFixed(2)}</span>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-4 rounded-xl transition-all flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isCheckingOut ? (
                  "Procesando..."
                ) : (
                  <>
                    Proceder al Pago
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
