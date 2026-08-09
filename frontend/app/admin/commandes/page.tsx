"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import AdminNav from "@/components/AdminNav";

type CommandeAdmin = {
  id: string;
  total: number;
  statut: string;
  ville: string;
  modePaiement: string;
  dateCreation: string;
  user: { nom: string; prenom: string; email: string };
  items: { quantite: number }[];
};

const STATUTS = ["EN_ATTENTE", "PAYEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE", "ANNULEE"];
const LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  PAYEE: "Payée",
  EN_PREPARATION: "En préparation",
  EXPEDIEE: "Expédiée",
  LIVREE: "Livrée",
  ANNULEE: "Annulée",
};

export default function AdminCommandesPage() {
  const { user, token, loading } = useAuth();
  const [commandes, setCommandes] = useState<CommandeAdmin[]>([]);
  const [chargement, setChargement] = useState(true);

  async function charger() {
    setChargement(true);
    try {
      const data = await api<CommandeAdmin[]>("/orders", { token });
      setCommandes(data);
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    if (token && user?.role === "ADMIN") charger();
  }, [token, user]);

  async function changerStatut(id: string, statut: string) {
    await api(`/orders/${id}/statut`, { method: "PUT", token, body: { statut } });
    setCommandes((prev) => prev.map((c) => (c.id === id ? { ...c, statut } : c)));
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
      <h1 className="font-display text-4xl text-sable mb-8">Commandes</h1>

      {chargement ? (
        <p className="font-body text-sable/50">Chargement...</p>
      ) : commandes.length === 0 ? (
        <p className="font-body text-sable/50">Aucune commande pour le moment.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {commandes.map((c) => (
            <div key={c.id} className="border border-charbon-line rounded-sm p-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="font-body text-sable">
                  {c.user.prenom} {c.user.nom}{" "}
                  <span className="font-mono text-xs text-sable/40">({c.user.email})</span>
                </p>
                <p className="font-mono text-xs text-sable/40">
                  #{c.id.slice(-8).toUpperCase()} · {c.ville} · {c.modePaiement} ·{" "}
                  {new Date(c.dateCreation).toLocaleDateString("fr-FR")} · {c.items.length} article(s)
                </p>
              </div>

              <p className="font-mono text-sable w-28 text-right">
                {c.total.toLocaleString("fr-FR")} F
              </p>

              <select
                value={c.statut}
                onChange={(e) => changerStatut(c.id, e.target.value)}
                className="bg-charbon-soft border border-charbon-line rounded-sm px-3 py-2 text-sable text-sm"
              >
                {STATUTS.map((s) => (
                  <option key={s} value={s}>
                    {LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
