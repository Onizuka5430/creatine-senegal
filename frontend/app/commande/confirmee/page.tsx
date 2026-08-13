"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CommandeConfirmeePage() {
  return (
    <Suspense fallback={null}>
      <Confirmation />
    </Suspense>
  );
}

function Confirmation() {
  const searchParams = useSearchParams();
  const whatsappUrl = searchParams.get("whatsapp");
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    if (whatsappUrl && !ouvert) {
      // Tente d'ouvrir WhatsApp automatiquement. Si le navigateur bloque le
      // popup, le bouton manuel ci-dessous prend le relais.
      window.open(whatsappUrl, "_blank");
      setOuvert(true);
    }
  }, [whatsappUrl, ouvert]);

  return (
    <div className="max-w-md mx-auto py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-braise/10 border border-braise flex items-center justify-center mx-auto mb-6">
        <span className="text-braise text-2xl">✓</span>
      </div>

      <h1 className="font-display text-4xl text-sable mb-4">Commande enregistrée</h1>

      {whatsappUrl ? (
        <>
          <p className="font-body text-sable/70 mb-8">
            Un onglet WhatsApp a dû s'ouvrir avec ta commande pré-remplie. Il ne reste plus
            qu'à appuyer sur "Envoyer" pour confirmer auprès de la boutique.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-braise text-charbon font-semibold px-6 py-3 rounded-sm hover:bg-braise-light transition-colors mb-4"
          >
            Ouvrir WhatsApp manuellement
          </a>
        </>
      ) : (
        <p className="font-body text-sable/70 mb-8">
          Ta commande a bien été enregistrée. La boutique n'a pas encore configuré son
          numéro WhatsApp — tu seras contacté directement par téléphone.
        </p>
      )}

      <div>
        <Link href="/compte" className="font-mono text-sm text-braise hover:underline">
          Voir mes commandes →
        </Link>
      </div>
    </div>
  );
}
