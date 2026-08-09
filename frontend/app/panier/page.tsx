"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function PanierPage() {
  const { items, retirer, modifierQuantite, sousTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="font-display text-4xl text-sable mb-4">Votre panier est vide</p>
        <Link href="/produits" className="text-braise font-mono hover:underline">
          Voir les produits →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-sable mb-8">Votre panier</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 border border-charbon-line rounded-sm p-4"
            >
              <div className="w-16 h-16 bg-charbon-line rounded-sm flex items-center justify-center flex-shrink-0">
                {item.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.photo} alt={item.nom} className="w-full h-full object-cover rounded-sm" />
                ) : (
                  <span className="font-display text-sable/20 text-xl">CS</span>
                )}
              </div>

              <div className="flex-1">
                <p className="font-body text-sable">{item.nom}</p>
                <p className="font-mono text-sm text-sable/50">
                  {item.prix.toLocaleString("fr-FR")} F CFA
                </p>
              </div>

              <div className="flex items-center border border-charbon-line rounded-sm">
                <button
                  onClick={() => modifierQuantite(item.productId, item.quantite - 1)}
                  className="w-8 h-8 text-sable hover:text-braise"
                >
                  −
                </button>
                <span className="w-8 text-center font-mono text-sable text-sm">
                  {item.quantite}
                </span>
                <button
                  onClick={() =>
                    modifierQuantite(item.productId, Math.min(item.stock, item.quantite + 1))
                  }
                  className="w-8 h-8 text-sable hover:text-braise"
                >
                  +
                </button>
              </div>

              <p className="font-mono text-sable w-24 text-right">
                {(item.prix * item.quantite).toLocaleString("fr-FR")} F
              </p>

              <button
                onClick={() => retirer(item.productId)}
                className="text-sable/40 hover:text-braise"
                aria-label="Retirer l'article"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="border border-charbon-line rounded-sm p-6 h-fit">
          <h2 className="font-display text-2xl text-sable mb-4">Récapitulatif</h2>
          <div className="flex justify-between font-body text-sable/70 mb-2">
            <span>Sous-total</span>
            <span className="font-mono">{sousTotal.toLocaleString("fr-FR")} F</span>
          </div>
          <p className="font-mono text-xs text-sable/40 mb-4">
            Frais de livraison calculés à l'étape suivante
          </p>
          <Link
            href="/checkout"
            className="block text-center bg-braise text-charbon font-semibold py-3 rounded-sm hover:bg-braise-light transition-colors"
          >
            Passer la commande
          </Link>
        </div>
      </div>
    </div>
  );
}
