"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Order } from "@/lib/types";

const STATUTS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  PAYEE: "Payée",
  EN_PREPARATION: "En préparation",
  EXPEDIEE: "Expédiée",
  LIVREE: "Livrée",
  ANNULEE: "Annulée",
};

export default function ComptePage() {
  const { user, token, loading } = useAuth();
  const [commandes, setCommandes] = useState<Order[]>([]);

  useEffect(() => {
    if (token) {
      api<Order[]>("/orders/mes-commandes", { token }).then(setCommandes).catch(() => {});
    }
  }, [token]);

  if (loading) return null;

  if (!user) {
    return (
      <div className="text-center py-24">
        <p className="font-display text-3xl text-sable mb-4">Connectez-vous pour voir votre compte</p>
        <a href="/connexion" className="text-braise font-mono hover:underline">
          Se connecter →
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-sable mb-2">Bonjour {user.prenom}</h1>
      <p className="font-body text-sable/60 mb-10">{user.email}</p>

      <h2 className="font-display text-2xl text-sable mb-4">Mes commandes</h2>

      {commandes.length === 0 ? (
        <p className="font-body text-sable/50">Vous n'avez pas encore passé de commande.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {commandes.map((c) => (
            <div key={c.id} className="border border-charbon-line rounded-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-sm text-sable/50">
                  Commande #{c.id.slice(-8).toUpperCase()} —{" "}
                  {new Date(c.dateCreation).toLocaleDateString("fr-FR")}
                </p>
                <span className="font-mono text-xs uppercase bg-charbon-soft border border-charbon-line rounded-sm px-2 py-1 text-braise">
                  {STATUTS[c.statut] ?? c.statut}
                </span>
              </div>
              <div className="flex flex-col gap-1 mb-3">
                {c.items.map((it, idx) => (
                  <p key={idx} className="font-body text-sable/70 text-sm">
                    {it.quantite} × {it.product.nom}
                  </p>
                ))}
              </div>
              <div className="flex justify-between font-display text-lg text-sable">
                <span>Total</span>
                <span className="font-mono">{c.total.toLocaleString("fr-FR")} F CFA</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
