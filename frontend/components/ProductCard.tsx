"use client";

import Link from "next/link";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import DosageGauge from "./DosageGauge";

export default function ProductCard({ produit }: { produit: Product }) {
  const { ajouter } = useCart();
  const prixFinal = produit.promotion
    ? produit.prix * (1 - produit.promotion / 100)
    : produit.prix;

  return (
    <div className="group border border-charbon-line bg-charbon-soft rounded-sm overflow-hidden flex flex-col">
      <Link href={`/produits/${produit.slug}`} className="block">
        <div className="aspect-square bg-charbon-line flex items-center justify-center overflow-hidden">
          {produit.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={produit.photo}
              alt={produit.nom}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="font-display text-4xl text-sable/20">
              {produit.marque?.[0] ?? "CS"}
            </span>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-braise font-mono">
              {produit.marque}
            </p>
            <Link href={`/produits/${produit.slug}`}>
              <h3 className="font-display text-lg text-sable leading-tight hover:text-braise transition-colors">
                {produit.nom}
              </h3>
            </Link>
          </div>
          {produit.dosage && <DosageGauge label={produit.poids ?? ""} pourcentage={100} size={44} />}
        </div>

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            {produit.promotion ? (
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-lg text-sable">
                  {prixFinal.toLocaleString("fr-FR")} F
                </span>
                <span className="font-mono text-xs text-sable/40 line-through">
                  {produit.prix.toLocaleString("fr-FR")} F
                </span>
              </div>
            ) : (
              <span className="font-mono text-lg text-sable">
                {produit.prix.toLocaleString("fr-FR")} F
              </span>
            )}
          </div>

          <button
            onClick={() => ajouter(produit, 1)}
            disabled={!produit.disponible || produit.stock === 0}
            className="text-xs font-semibold uppercase tracking-wide bg-braise text-charbon px-3 py-2 rounded-sm hover:bg-braise-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {produit.stock === 0 ? "Épuisé" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}
