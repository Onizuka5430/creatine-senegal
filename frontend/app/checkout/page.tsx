"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import api from "@/lib/api";

const VILLES = ["Dakar", "Thiès", "Saint-Louis", "Kaolack", "Autre"];
const FRAIS: Record<string, number> = {
  Dakar: 1500,
  Thiès: 2000,
  "Saint-Louis": 2500,
  Kaolack: 2500,
  Autre: 3000,
};

export default function CheckoutPage() {
  const { user, token } = useAuth();
  const { items, sousTotal, vider } = useCart();
  const router = useRouter();

  const [ville, setVille] = useState("Dakar");
  const [adresse, setAdresse] = useState("");
  const [telephone, setTelephone] = useState(user?.telephone || "");
  const [modePaiement, setModePaiement] = useState<"WAVE" | "ORANGE_MONEY" | "CARTE" | "LIVRAISON">(
    "WAVE"
  );
  const [couponCode, setCouponCode] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const fraisLivraison = FRAIS[ville] ?? FRAIS.Autre;
  const total = sousTotal + fraisLivraison;

  if (!user) {
    return (
      <div className="text-center py-24">
        <p className="font-display text-3xl text-sable mb-4">Connectez-vous pour commander</p>
        <a href="/connexion?retour=/checkout" className="text-braise font-mono hover:underline">
          Se connecter →
        </a>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="font-display text-3xl text-sable">Votre panier est vide</p>
      </div>
    );
  }

  async function passerCommande(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setEnvoi(true);

    try {
      const commande = await api<{ id: string }>("/orders", {
        method: "POST",
        token,
        body: {
          items: items.map((i) => ({ productId: i.productId, quantite: i.quantite })),
          ville,
          adresse,
          telephone,
          modePaiement,
          couponCode: couponCode || undefined,
        },
      });

      // Déclenche l'initiation de paiement si Wave ou Orange Money
      if (modePaiement === "WAVE" || modePaiement === "ORANGE_MONEY") {
        const endpoint = modePaiement === "WAVE" ? "/payments/wave" : "/payments/orange-money";
        await api(endpoint, { method: "POST", token, body: { orderId: commande.id } });
      }

      vider();
      router.push(`/compte?commande=${commande.id}`);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur lors de la commande.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <form onSubmit={passerCommande} className="md:col-span-2 flex flex-col gap-6">
        <h1 className="font-display text-4xl text-sable">Finaliser la commande</h1>

        <div>
          <label className="font-mono text-xs text-sable/50 uppercase">Ville</label>
          <select
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            className="w-full mt-1 bg-charbon-soft border border-charbon-line rounded-sm px-4 py-3 text-sable"
          >
            {VILLES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-mono text-xs text-sable/50 uppercase">Adresse de livraison</label>
          <input
            required
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            placeholder="Quartier, rue, repère..."
            className="w-full mt-1 bg-charbon-soft border border-charbon-line rounded-sm px-4 py-3 text-sable placeholder:text-sable/30"
          />
        </div>

        <div>
          <label className="font-mono text-xs text-sable/50 uppercase">Téléphone</label>
          <input
            required
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="+221 77 000 00 00"
            className="w-full mt-1 bg-charbon-soft border border-charbon-line rounded-sm px-4 py-3 text-sable placeholder:text-sable/30"
          />
        </div>

        <div>
          <label className="font-mono text-xs text-sable/50 uppercase mb-2 block">
            Mode de paiement
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "WAVE", label: "Wave" },
              { id: "ORANGE_MONEY", label: "Orange Money" },
              { id: "CARTE", label: "Carte bancaire" },
              { id: "LIVRAISON", label: "À la livraison" },
            ].map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => setModePaiement(m.id as typeof modePaiement)}
                className={`border rounded-sm px-4 py-3 font-body text-sm transition-colors ${
                  modePaiement === m.id
                    ? "border-braise text-braise bg-braise/10"
                    : "border-charbon-line text-sable/70 hover:border-sable/40"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="font-mono text-xs text-sable/50 uppercase">Code promo (optionnel)</label>
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="BIENVENUE10"
            className="w-full mt-1 bg-charbon-soft border border-charbon-line rounded-sm px-4 py-3 text-sable placeholder:text-sable/30"
          />
        </div>

        {erreur && <p className="text-braise font-body text-sm">{erreur}</p>}

        <button
          type="submit"
          disabled={envoi}
          className="bg-braise text-charbon font-semibold py-3 rounded-sm hover:bg-braise-light transition-colors disabled:opacity-50"
        >
          {envoi ? "Traitement..." : `Payer ${total.toLocaleString("fr-FR")} F CFA`}
        </button>
      </form>

      <div className="border border-charbon-line rounded-sm p-6 h-fit">
        <h2 className="font-display text-2xl text-sable mb-4">Résumé</h2>
        {items.map((i) => (
          <div key={i.productId} className="flex justify-between text-sm font-body text-sable/70 mb-2">
            <span>
              {i.nom} × {i.quantite}
            </span>
            <span className="font-mono">{(i.prix * i.quantite).toLocaleString("fr-FR")} F</span>
          </div>
        ))}
        <div className="border-t border-charbon-line mt-4 pt-4 flex justify-between font-body text-sable/70">
          <span>Sous-total</span>
          <span className="font-mono">{sousTotal.toLocaleString("fr-FR")} F</span>
        </div>
        <div className="flex justify-between font-body text-sable/70">
          <span>Livraison ({ville})</span>
          <span className="font-mono">{fraisLivraison.toLocaleString("fr-FR")} F</span>
        </div>
        <div className="flex justify-between font-display text-xl text-sable mt-2">
          <span>Total</span>
          <span className="font-mono">{total.toLocaleString("fr-FR")} F</span>
        </div>
      </div>
    </div>
  );
}
