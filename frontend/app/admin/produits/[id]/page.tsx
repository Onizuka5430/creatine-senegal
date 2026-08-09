"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Product } from "@/lib/types";
import AdminNav from "@/components/AdminNav";
import ProductForm from "@/components/ProductForm";

export default function ModifierProduitPage({ params }: { params: { id: string } }) {
  const { user, token, loading } = useAuth();
  const [produit, setProduit] = useState<Product | null>(null);

  useEffect(() => {
    if (token && user?.role === "ADMIN") {
      api<Product>(`/products/id/${params.id}`, { token }).then(setProduit).catch(() => {});
    }
  }, [token, user, params.id]);

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
      <h1 className="font-display text-4xl text-sable mb-8">Modifier le produit</h1>
      {produit ? <ProductForm produit={produit} /> : <p className="font-body text-sable/50">Chargement...</p>}
    </div>
  );
}
