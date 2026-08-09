import { API_URL } from "@/lib/api";
import { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

async function getProduits(searchParams: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  if (searchParams.search) params.set("search", searchParams.search);
  if (searchParams.tri) params.set("tri", searchParams.tri);
  params.set("limite", "24");

  try {
    const res = await fetch(`${API_URL}/products?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) return { produits: [] as Product[] };
    return res.json();
  } catch {
    return { produits: [] as Product[] };
  }
}

export default async function ProduitsPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const { produits } = await getProduits(searchParams);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl text-sable">Tous les produits</h1>
          <p className="font-body text-sable/60 mt-1">{produits.length} produits disponibles</p>
        </div>

        <form className="flex gap-2" action="/produits">
          <input
            type="text"
            name="search"
            defaultValue={searchParams.search}
            placeholder="Rechercher un produit..."
            className="bg-charbon-soft border border-charbon-line rounded-sm px-4 py-2 text-sable placeholder:text-sable/30 font-body focus:border-braise outline-none"
          />
          <select
            name="tri"
            defaultValue={searchParams.tri || "recent"}
            className="bg-charbon-soft border border-charbon-line rounded-sm px-3 py-2 text-sable font-body"
          >
            <option value="recent">Nouveautés</option>
            <option value="prix_asc">Prix croissant</option>
            <option value="prix_desc">Prix décroissant</option>
            <option value="populaire">Popularité</option>
          </select>
          <button
            type="submit"
            className="bg-braise text-charbon font-semibold px-4 py-2 rounded-sm hover:bg-braise-light transition-colors"
          >
            Filtrer
          </button>
        </form>
      </div>

      {produits.length === 0 ? (
        <div className="border border-dashed border-charbon-line rounded-sm p-10 text-center text-sable/50 font-body">
          Aucun produit trouvé.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {produits.map((p: Product) => (
            <ProductCard key={p.id} produit={p} />
          ))}
        </div>
      )}
    </div>
  );
}
