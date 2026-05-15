"use client";

import Link from "next/link";
import { ShoppingCart, BookOpen, User, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useCartStore } from "@/store/cartStore";

export function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Evitar errores de hidratación
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    // Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-heading font-bold text-xl tracking-tight">
            Librería<span className="text-primary"> con Causa</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/cart" className="relative group">
            <ShoppingCart className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
            {isMounted && getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors">
                Admin Panel
              </Link>
              <span className="text-sm font-medium hidden sm:inline text-foreground/80 border-l border-border pl-4">
                {user.email}
              </span>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 group text-red-500 hover:text-red-600 transition-colors ml-2"
                title="Cerrar Sesión"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-2 group">
              <User className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium group-hover:text-primary transition-colors hidden sm:inline">
                Login
              </span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
