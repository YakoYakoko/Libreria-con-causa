"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  price: number;
  imageUrl: string;
}

export function BookCard({ id, title, author, price, imageUrl }: BookCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id, title, price, imageUrl });
  };
  return (
    <Link href={`/book/${id}`} className="glass-card rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300 flex flex-col h-full group">
      <div className="relative h-64 w-full bg-muted/20">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-contain"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button 
            onClick={handleAddToCart}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-full font-medium flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-heading font-semibold text-lg line-clamp-2 mb-1">
          {title}
        </h3>
        <p className="text-sm text-foreground/70 mb-4">{author}</p>
        <div className="mt-auto flex items-center justify-between">
          <span className="font-bold text-xl text-primary">${price.toFixed(2)}</span>
        </div>
      </div>
    </Link>
  );
}
