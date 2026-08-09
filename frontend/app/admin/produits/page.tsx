"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api, { API_URL } from "@/lib/api";
import { Product } from "@/lib/types";
import AdminNav from "@/components/AdminNav";

export default function AdminProduitsPage() {
  const { user, token, loading } = useAuth();
  const [produits, setProduits] = useState<Product[]>([]);
  const [chargement, setChargement] = useState(true);

  async function charger() {
    setChargement(true);
    try {
      const res = await fetch(`${API_URL}/products?limite=100`, { cache: "no-store" });
      const data = await res.json();
      setProduits(data.produits || []);
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    if (user?.role === "ADMIN") charger();
  }, [user]);

  async function supprimer(id: string) {
    if (!confirm("Supprimer ce produit définitivement ?")) return;
    await api(`/products/${id}`, { method: "DELETE", token });
    charger();
  }

  if (loading) return null;

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="text-center py-24">
        <p className="font-display text-3xl text-sable">Accès réservé aux administrateurs</p>
      </div>
    );
  }

  return (
    <div>
      <AdminNav />
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl text-sable">Produits</h1>
        <Link
          href="/admin/produits/nouveau"
          className="bg-braise text-charbon font-semibold px-4 py-2 rounded-sm hover:bg-braise-light transition-colors"
        >
          + Ajouter un produit
        </Link>
      </div>

      {chargement ? (
        <p className="font-body text-sable/50">Chargement...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {produits.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-4 border border-charbon-line rounded-sm p-4"
            >
              <div className="w-14 h-14 bg-charbon-line rounded-sm flex-shrink-0 flex items-center justify-center overflow-hidden">
                {p.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.photo} alt={p.nom} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-mono text-xs text-sable/30">Photo</span>
                )}
              </div>

              <div className="flex-1">
                <p className="font-body text-sable">{p.nom}</p>
                <p className="font-mono text-xs text-sable/40">
                  {p.category?.nom} · {p.prix.toLocaleString("fr-FR")} F · stock {p.stock}
                  {!p.disponible && " · masqué"}
                </p>
              </div>

              <Link
                href={`/admin/produits/${p.id}`}
                className="text-sm font-body text-cobalt hover:underline"
              >
                Modifier
              </Link>
              <button
                onClick={() => supprimer(p.id)}
                className="text-sm font-body text-braise hover:underline"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
