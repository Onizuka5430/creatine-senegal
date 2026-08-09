"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { CartItem, Product } from "@/lib/types";

type CartContextType = {
  items: CartItem[];
  ajouter: (produit: Product, quantite?: number) => void;
  retirer: (productId: string) => void;
  modifierQuantite: (productId: string, quantite: number) => void;
  vider: () => void;
  sousTotal: number;
  nombreArticles: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "cs_panier";

function prixEffectif(produit: Product) {
  return produit.promotion ? produit.prix * (1 - produit.promotion / 100) : produit.prix;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setItems(JSON.parse(saved));
    setPret(true);
  }, []);

  useEffect(() => {
    if (pret) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, pret]);

  function ajouter(produit: Product, quantite = 1) {
    setItems((prev) => {
      const existant = prev.find((i) => i.productId === produit.id);
      if (existant) {
        return prev.map((i) =>
          i.productId === produit.id
            ? { ...i, quantite: Math.min(i.quantite + quantite, produit.stock) }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: produit.id,
          nom: produit.nom,
          prix: prixEffectif(produit),
          photo: produit.photo,
          quantite,
          stock: produit.stock,
        },
      ];
    });
  }

  function retirer(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function modifierQuantite(productId: string, quantite: number) {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantite: Math.max(1, quantite) } : i))
    );
  }

  function vider() {
    setItems([]);
  }

  const sousTotal = items.reduce((sum, i) => sum + i.prix * i.quantite, 0);
  const nombreArticles = items.reduce((sum, i) => sum + i.quantite, 0);

  return (
    <CartContext.Provider
      value={{ items, ajouter, retirer, modifierQuantite, vider, sousTotal, nombreArticles }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé à l'intérieur de <CartProvider>");
  return ctx;
}
