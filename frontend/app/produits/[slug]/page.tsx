import { API_URL } from "@/lib/api";
import { Product } from "@/lib/types";
import AddToCartPanel from "@/components/AddToCartPanel";

async function getProduit(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ProduitDetailPage({ params }: { params: { slug: string } }) {
  const produit = await getProduit(params.slug);

  if (!produit) {
    return (
      <div className="text-center py-20">
        <p className="font-display text-3xl text-sable">Produit introuvable</p>
      </div>
    );
  }

  const prixFinal = produit.promotion
    ? produit.prix * (1 - produit.promotion / 100)
    : produit.prix;

  return (
    <div className="grid md:grid-cols-2 gap-12">
      <div className="aspect-square bg-charbon-soft border border-charbon-line rounded-sm flex items-center justify-center">
        {produit.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={produit.photo} alt={produit.nom} className="w-full h-full object-cover" />
        ) : (
          <span className="font-display text-7xl text-sable/20">{produit.marque?.[0] ?? "CS"}</span>
        )}
      </div>

      <div>
        <p className="font-mono text-braise text-sm uppercase tracking-wide mb-2">{produit.marque}</p>
        <h1 className="font-display text-5xl text-sable leading-none mb-4">{produit.nom}</h1>

        <div className="flex items-baseline gap-3 mb-6">
          <span className="font-mono text-3xl text-sable">
            {prixFinal.toLocaleString("fr-FR")} F CFA
          </span>
          {produit.promotion ? (
            <span className="font-mono text-lg text-sable/40 line-through">
              {produit.prix.toLocaleString("fr-FR")} F
            </span>
          ) : null}
        </div>

        <p className="font-body text-sable/70 leading-relaxed mb-6">{produit.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {produit.dosage && (
            <div className="border border-charbon-line rounded-sm p-4">
              <p className="font-mono text-xs text-sable/40 uppercase">Dosage conseillé</p>
              <p className="font-body text-sable mt-1">{produit.dosage}</p>
            </div>
          )}
          {produit.poids && (
            <div className="border border-charbon-line rounded-sm p-4">
              <p className="font-mono text-xs text-sable/40 uppercase">Format</p>
              <p className="font-body text-sable mt-1">{produit.poids}</p>
            </div>
          )}
          {produit.ingredients && (
            <div className="border border-charbon-line rounded-sm p-4 col-span-2">
              <p className="font-mono text-xs text-sable/40 uppercase">Ingrédients</p>
              <p className="font-body text-sable mt-1">{produit.ingredients}</p>
            </div>
          )}
        </div>

        <AddToCartPanel produit={produit} />

        {produit.avis && produit.avis.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-2xl text-sable mb-4">Avis clients</h2>
            <div className="flex flex-col gap-3">
              {produit.avis.map((a) => (
                <div key={a.id} className="border border-charbon-line rounded-sm p-4">
                  <p className="font-mono text-braise text-sm">{"★".repeat(a.note)}</p>
                  <p className="font-body text-sable/70 mt-1">{a.commentaire}</p>
                  <p className="font-mono text-xs text-sable/30 mt-2">— {a.user?.prenom}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
