"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ConnexionPage() {
  return (
    <Suspense fallback={null}>
      <ConnexionForm />
    </Suspense>
  );
}

function ConnexionForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setEnvoi(true);
    try {
      await login(email, motDePasse);
      router.push(searchParams.get("retour") || "/compte");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur de connexion.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="font-display text-4xl text-sable mb-8">Connexion</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="font-mono text-xs text-sable/50 uppercase">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 bg-charbon-soft border border-charbon-line rounded-sm px-4 py-3 text-sable"
          />
        </div>
        <div>
          <label className="font-mono text-xs text-sable/50 uppercase">Mot de passe</label>
          <input
            type="password"
            required
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className="w-full mt-1 bg-charbon-soft border border-charbon-line rounded-sm px-4 py-3 text-sable"
          />
        </div>

        {erreur && <p className="text-braise font-body text-sm">{erreur}</p>}

        <button
          type="submit"
          disabled={envoi}
          className="bg-braise text-charbon font-semibold py-3 rounded-sm hover:bg-braise-light transition-colors disabled:opacity-50"
        >
          {envoi ? "Connexion..." : "Se connecter"}
        </button>

        <p className="font-body text-sable/50 text-sm text-center mt-2">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="text-braise hover:underline">
            Inscrivez-vous
          </Link>
        </p>
      </form>
    </div>
  );
}
