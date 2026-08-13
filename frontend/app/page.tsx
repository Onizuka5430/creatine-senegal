import Link from "next/link";
import { API_URL } from "@/lib/api";
import { Product, Category } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

async function getProduits(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products?tri=recent&limite=8`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.produits ?? [];
  } catch {
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [produits, categories] = await Promise.all([getProduits(), getCategories()]);

  return (
    <div className="flex flex-col gap-20">
      {/* Hero */}
      <section className="grid md:grid-cols-2 gap-10 items-center pt-8">
        <div>
          <p className="font-mono text-braise text-sm uppercase tracking-[0.2em] mb-4">
            5g par jour. Zéro approximation.
          </p>
          <h1 className="font-display text-6xl md:text-7xl leading-[0.95] text-sable mb-6">
            LA DOSE JUSTE,
            <br />
            <span className="text-braise">PARTOUT AU SÉNÉGAL</span>
          </h1>
          <p className="text-sable/70 font-body text-lg mb-8 max-w-md">
            Créatine, whey, pré-workout et vitamines authentiques, livrés à Dakar, Thiès,
            Saint-Louis et Kaolack. Paiement Wave ou Orange Money en un tap.
          </p>
          <div className="flex gap-4">
            <Link
              href="/produits"
              className="bg-braise text-charbon font-semibold px-6 py-3 rounded-sm hover:bg-braise-light transition-colors"
            >
              Voir les produits
            </Link>
            <Link
              href="/categorie/creatine"
              className="border border-charbon-line text-sable px-6 py-3 rounded-sm hover:border-braise transition-colors"
            >
              La créatine, c'est quoi ?
            </Link>
          </div>
        </div>

        <div className="relative aspect-square bg-charbon-soft border border-charbon-line rounded-sm flex items-center justify-center overflow-hidden">
          <div
            className="dosage-gauge w-64 h-64 rounded-full flex items-center justify-center"
            style={{ ["--pct" as string]: "72%" }}
          >
            <div className="bg-charbon rounded-full w-[80%] h-[80%] flex flex-col items-center justify-center">
              <span className="font-display text-5xl text-sable">5g</span>
              <span className="font-mono text-xs text-sable/50 uppercase tracking-wide">
                dose quotidienne
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Catégories */}
      {categories.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-display text-3xl text-sable">Catégories</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categorie/${cat.slug}`}
                className="border border-charbon-line bg-charbon-soft rounded-sm p-5 hover:border-braise transition-colors"
              >
                <p className="font-display text-xl text-sable">{cat.nom}</p>
                <p className="font-mono text-xs text-sable/40 mt-1">
                  {cat._count?.produits ?? 0} produits
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Produits */}
      <section>
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-3xl text-sable">Nouveautés</h2>
          <Link href="/produits" className="font-mono text-sm text-braise hover:underline">
            Tout voir →
          </Link>
        </div>

        {produits.length === 0 ? (
          <div className="border border-dashed border-charbon-line rounded-sm p-10 text-center text-sable/50 font-body">
            La boutique n'a pas encore de produits en ligne. Connecte-toi en tant
            qu'administrateur pour ajouter le premier.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {produits.map((p) => (
              <ProductCard key={p.id} produit={p} />
            ))}
          </div>
        )}
      </section>

      {/* Paiement */}
      <section className="border border-charbon-line bg-charbon-soft rounded-sm p-8 grid md:grid-cols-3 gap-6 text-center">
        <div>
          <p className="font-display text-2xl text-braise">WAVE</p>
          <p className="font-body text-sable/60 text-sm mt-1">Paiement instantané et sécurisé</p>
        </div>
        <div>
          <p className="font-display text-2xl text-braise">ORANGE MONEY</p>
          <p className="font-body text-sable/60 text-sm mt-1">Payez directement depuis votre solde</p>
        </div>
        <div>
          <p className="font-display text-2xl text-braise">À LA LIVRAISON</p>
          <p className="font-body text-sable/60 text-sm mt-1">Payez en espèces à réception</p>
        </div>
      </section>
    </div>
  );
}
