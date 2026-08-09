"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import AdminNav from "@/components/AdminNav";

type Dashboard = {
  nombreCommandes: number;
  chiffreAffaires: number;
  nombreClients: number;
  commandesDuJour: number;
  panierMoyen: number;
  produitsStockFaible: { id: string; nom: string; stock: number }[];
  topProduits: { produit: string; quantiteVendue: number }[];
};

export default function AdminDashboardPage() {
  const { user, token, loading } = useAuth();
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    if (token && user?.role === "ADMIN") {
      api<Dashboard>("/admin/dashboard", { token }).then(setData).catch(() => {});
    }
  }, [token, user]);

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
      <h1 className="font-display text-4xl text-sable mb-8">Tableau de bord</h1>

      {!data ? (
        <p className="font-body text-sable/50">Chargement...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: "Chiffre d'affaires", value: `${data.chiffreAffaires.toLocaleString("fr-FR")} F` },
              { label: "Commandes", value: data.nombreCommandes },
              { label: "Clients", value: data.nombreClients },
              { label: "Commandes aujourd'hui", value: data.commandesDuJour },
              { label: "Panier moyen", value: `${Math.round(data.panierMoyen).toLocaleString("fr-FR")} F` },
            ].map((kpi) => (
              <div key={kpi.label} className="border border-charbon-line bg-charbon-soft rounded-sm p-5">
                <p className="font-mono text-xs text-sable/40 uppercase">{kpi.label}</p>
                <p className="font-display text-3xl text-braise mt-2">{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="font-display text-2xl text-sable mb-4">Produits les plus vendus</h2>
              <div className="flex flex-col gap-2">
                {data.topProduits.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between border border-charbon-line rounded-sm px-4 py-3"
                  >
                    <span className="font-body text-sable/80">{p.produit}</span>
                    <span className="font-mono text-braise">{p.quantiteVendue} vendus</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl text-sable mb-4">Stock faible</h2>
              <div className="flex flex-col gap-2">
                {data.produitsStockFaible.length === 0 ? (
                  <p className="font-body text-sable/50">Aucune alerte de stock.</p>
                ) : (
                  data.produitsStockFaible.map((p) => (
                    <div
                      key={p.id}
                      className="flex justify-between border border-braise/40 bg-braise/5 rounded-sm px-4 py-3"
                    >
                      <span className="font-body text-sable/80">{p.nom}</span>
                      <span className="font-mono text-braise">{p.stock} restants</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
