"use client";

import { useAuth } from "@/context/AuthContext";
import AdminNav from "@/components/AdminNav";
import ProductForm from "@/components/ProductForm";

export default function NouveauProduitPage() {
  const { user, loading } = useAuth();

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
      <h1 className="font-display text-4xl text-sable mb-8">Nouveau produit</h1>
      <ProductForm />
    </div>
  );
}
