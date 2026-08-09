import { API_URL } from "@/lib/api";
import { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

async function getProduits(slug: string) {
  try {
    const res = await fetch(`${API_URL}/products?categorie=${slug}&limite=24`, {
      cache: "no-store",
    });
    if (!res.ok) return { produits: [] as Product[] };
    return res.json();
  } catch {
    return { produits: [] as Product[] };
  }
}

export default async function CategoriePage({ params }: { params: { slug: string } }) {
  const { produits } = await getProduits(params.slug);

  return (
    <div>
      <h1 className="font-display text-4xl text-sable mb-2 capitalize">
        {params.slug.replace(/-/g, " ")}
      </h1>
      <p className="font-body text-sable/60 mb-8">{produits.length} produits</p>

      {produits.length === 0 ? (
        <div className="border border-dashed border-charbon-line rounded-sm p-10 text-center text-sable/50 font-body">
          Aucun produit dans cette catégorie pour le moment.
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
