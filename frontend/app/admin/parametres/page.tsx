"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import AdminNav from "@/components/AdminNav";

type Settings = { nomBoutique: string; whatsapp: string | null };

export default function ParametresPage() {
  const { user, token, loading } = useAuth();
  const [nomBoutique, setNomBoutique] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [charge, setCharge] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api<Settings>("/settings")
      .then((s) => {
        setNomBoutique(s.nomBoutique);
        setWhatsapp(s.whatsapp || "");
      })
      .finally(() => setCharge(false));
  }, []);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setMessage("");
    try {
      await api("/settings", { method: "PUT", token, body: { nomBoutique, whatsapp } });
      setMessage("Enregistré ✓");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.");
    } finally {
      setEnvoi(false);
    }
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
      <h1 className="font-display text-4xl text-sable mb-2">Paramètres</h1>
      <p className="font-body text-sable/60 mb-8 max-w-lg">
        Le numéro WhatsApp ci-dessous recevra un message pré-rempli à chaque fois qu'un
        client valide une commande.
      </p>

      {charge ? (
        <p className="font-body text-sable/50">Chargement...</p>
      ) : (
        <form onSubmit={enregistrer} className="flex flex-col gap-4 max-w-md">
          <div>
            <label className="font-mono text-xs text-sable/50 uppercase">Nom de la boutique</label>
            <input
              value={nomBoutique}
              onChange={(e) => setNomBoutique(e.target.value)}
              className="w-full mt-1 bg-charbon-soft border border-charbon-line rounded-sm px-4 py-3 text-sable"
            />
          </div>

          <div>
            <label className="font-mono text-xs text-sable/50 uppercase">
              Numéro WhatsApp (avec indicatif pays, ex : 221771234567)
            </label>
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="221771234567"
              className="w-full mt-1 bg-charbon-soft border border-charbon-line rounded-sm px-4 py-3 text-sable placeholder:text-sable/30"
            />
            <p className="font-mono text-xs text-sable/40 mt-1">
              Pas de +, pas d'espaces. Sénégal = 221, Mauritanie = 222.
            </p>
          </div>

          {message && (
            <p
              className={`font-body text-sm ${
                message.includes("✓") ? "text-green-400" : "text-braise"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={envoi}
            className="bg-braise text-charbon font-semibold py-3 rounded-sm hover:bg-braise-light transition-colors disabled:opacity-50"
          >
            {envoi ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      )}
    </div>
  );
}
