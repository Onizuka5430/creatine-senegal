"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function InscriptionPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    telephone: "",
    ville: "Dakar",
  });
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setEnvoi(true);
    try {
      await register(form);
      router.push("/compte");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur lors de l'inscription.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="font-display text-4xl text-sable mb-8">Créer un compte</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-mono text-xs text-sable/50 uppercase">Prénom</label>
            <input
              required
              value={form.prenom}
              onChange={set("prenom")}
              className="w-full mt-1 bg-charbon-soft border border-charbon-line rounded-sm px-4 py-3 text-sable"
            />
          </div>
          <div>
            <label className="font-mono text-xs text-sable/50 uppercase">Nom</label>
            <input
              required
              value={form.nom}
              onChange={set("nom")}
              className="w-full mt-1 bg-charbon-soft border border-charbon-line rounded-sm px-4 py-3 text-sable"
            />
          </div>
        </div>

        <div>
          <label className="font-mono text-xs text-sable/50 uppercase">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={set("email")}
            className="w-full mt-1 bg-charbon-soft border border-charbon-line rounded-sm px-4 py-3 text-sable"
          />
        </div>

        <div>
          <label className="font-mono text-xs text-sable/50 uppercase">Mot de passe</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.motDePasse}
            onChange={set("motDePasse")}
            className="w-full mt-1 bg-charbon-soft border border-charbon-line rounded-sm px-4 py-3 text-sable"
          />
        </div>

        <div>
          <label className="font-mono text-xs text-sable/50 uppercase">Téléphone</label>
          <input
            value={form.telephone}
            onChange={set("telephone")}
            placeholder="+221 77 000 00 00"
            className="w-full mt-1 bg-charbon-soft border border-charbon-line rounded-sm px-4 py-3 text-sable placeholder:text-sable/30"
          />
        </div>

        <div>
          <label className="font-mono text-xs text-sable/50 uppercase">Ville</label>
          <select
            value={form.ville}
            onChange={set("ville")}
            className="w-full mt-1 bg-charbon-soft border border-charbon-line rounded-sm px-4 py-3 text-sable"
          >
            {["Dakar", "Thiès", "Saint-Louis", "Kaolack", "Autre"].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {erreur && <p className="text-braise font-body text-sm">{erreur}</p>}

        <button
          type="submit"
          disabled={envoi}
          className="bg-braise text-charbon font-semibold py-3 rounded-sm hover:bg-braise-light transition-colors disabled:opacity-50"
        >
          {envoi ? "Création..." : "Créer mon compte"}
        </button>

        <p className="font-body text-sable/50 text-sm text-center mt-2">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="text-braise hover:underline">
            Connectez-vous
          </Link>
        </p>
      </form>
    </div>
  );
}
