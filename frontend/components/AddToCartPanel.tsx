"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Product } from "@/lib/types";

export default function AddToCartPanel({ produit }: { produit: Product }) {
  const { ajouter } = useCart();
  const [quantite, setQuantite] = useState(1);
  const [ajoute, setAjoute] = useState(false);

  function handleAjouter() {
    ajouter(produit, quantite);
    setAjoute(true);
    setTimeout(() => setAjoute(false), 2000);
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center border border-charbon-line rounded-sm">
        <button
          onClick={() => setQuantite((q) => Math.max(1, q - 1))}
          className="w-10 h-10 text-sable hover:text-braise"
          aria-label="Réduire la quantité"
        >
          −
        </button>
        <span className="w-10 text-center font-mono text-sable">{quantite}</span>
        <button
          onClick={() => setQuantite((q) => Math.min(produit.stock, q + 1))}
          className="w-10 h-10 text-sable hover:text-braise"
          aria-label="Augmenter la quantité"
        >
          +
        </button>
      </div>

      <button
        onClick={handleAjouter}
        disabled={!produit.disponible || produit.stock === 0}
        className="flex-1 bg-braise text-charbon font-semibold py-3 rounded-sm hover:bg-braise-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {produit.stock === 0 ? "Rupture de stock" : ajoute ? "Ajouté au panier ✓" : "Ajouter au panier"}
      </button>
    </div>
  );
}
