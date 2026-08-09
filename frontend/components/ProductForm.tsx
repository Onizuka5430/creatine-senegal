"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api, { API_URL } from "@/lib/api";
import { Category, Product } from "@/lib/types";

export default function ProductForm({ produit }: { produit?: Product }) {
  const { token } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [uploadEnCours, setUploadEnCours] = useState(false);

  const [form, setForm] = useState({
    nom: produit?.nom || "",
    description: produit?.description || "",
    ingredients: produit?.ingredients || "",
    dosage: produit?.dosage || "",
    prix: produit?.prix?.toString() || "",
    promotion: produit?.promotion?.toString() || "",
    poids: produit?.poids || "",
    marque: produit?.marque || "",
    stock: produit?.stock?.toString() || "0",
    disponible: produit?.disponible ?? true,
    categoryId: produit?.category?.id || "",
    photo: produit?.photo || "",
  });

  useEffect(() => {
    api<Category[]>("/categories").then(setCategories).catch(() => {});
  }, []);

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadEnCours(true);
    setErreur("");
    try {
      const body = new FormData();
      body.append("image", file);
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Échec de l'upload.");
      setForm((f) => ({ ...f, photo: data.url }));
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur lors de l'upload de l'image.");
    } finally {
      setUploadEnCours(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setEnvoi(true);

    const payload = {
      nom: form.nom,
      description: form.description,
      ingredients: form.ingredients || null,
      dosage: form.dosage || null,
      prix: parseFloat(form.prix),
      promotion: form.promotion ? parseFloat(form.promotion) : null,
      poids: form.poids || null,
      marque: form.marque || null,
      stock: parseInt(form.stock, 10),
      disponible: form.disponible,
      categoryId: form.categoryId,
      photo: form.photo || null,
    };

    try {
      if (produit) {
        await api(`/products/${produit.id}`, { method: "PUT", token, body: payload });
      } else {
        await api("/products", { method: "POST", token, body: payload });
      }
      router.push("/admin/produits");
      router.refresh();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-2xl">
      <div>
        <label className="font-mono text-xs text-sable/50 uppercase">Photo du produit</label>
        <div className="mt-2 flex items-center gap-4">
          <div className="w-24 h-24 bg-charbon-soft border border-charbon-line rounded-sm flex items-center justify-center overflow-hidden flex-shrink-0">
            {form.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.photo} alt="Aperçu" className="w-full h-full object-cover" />
            ) : (
              <span className="font-mono text-xs text-sable/30">Aucune</span>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploadEnCours}
              className="font-body text-sm text-sable/70 file:mr-3 file:px-3 file:py-2 file:rounded-sm file:border-0 file:bg-braise file:text-charbon file:font-semibold file:text-sm"
            />
            {uploadEnCours && <p className="font-mono text-xs text-braise mt-1">Envoi en cours...</p>}
          </div>
        </div>
      </div>

      <div>
        <label className="font-mono text-xs text-sable/50 uppercase">Nom du produit</label>
        <input
          required
          value={form.nom}
          onChange={set("nom")}
          className="w-full mt-1 bg-charbon-soft border border-charbon-line rounded-sm px-4 py-3 text-sable"
        />
      </div>

      <div>
        <label className="font-mono text-xs text-sable/50 uppercase">Description</label>
        <textarea
          required
          rows={3}
          value={form.description}
          onChange={set("description")}
          className="w-full mt-1 bg-charbon-soft border border-charbon-line rounded-sm px-4 py-3 text-sable"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-mono text-xs text-sable/50 uppercase">Ingrédients</label>
          <input
            value={form.ingredients}
            onChange={set("ingredients")}
            className="w-full mt-1 bg-charbon-soft border border-charbon-line rounded-sm px-4 py-3 text-sable"
          />
        </div>
        <div>
          <label className="font-mono text-xs text-sable/50 uppercase">Dosage conseillé</label>
          <input
            value={form.dosage}
            onChange={set("dosage")}
            className="w-full mt-1 bg-charbon-soft border border-charbon-line rounded-sm px-4 py-3 text-sable"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="font-mono text-xs text-sable/50 uppercase">Prix (F CFA)</label>
          <input
            required
            type="number"
            min="0"
            value={form.prix}
            onChange={set("prix")}
            className="w-full mt-1 bg-charbon-soft border border-charbon-line rounded-sm px-4 py-3 text-sable"
          />
        </div>
        <div>
          <label className="font-mono text-xs text-sable/50 uppercase">Promotion (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={form.promotion}
            onChange={set("promotion")}
            className="w-full mt-1 bg-charbon-soft border border-charbon-line rounded-sm px-4 py-3 text-sable"
          />
        </div>
        <div>
          <label className="font-mono text-xs text-sable/50 uppercase">Stock</label>
          <input
            required
            type="number"
            min="0"
            value={form.stock}
            onChange={set("stock")}
            className="w-full mt-1 bg-charbon-soft border border-charbon-line rounded-sm px-4 py-3 text-sable"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-mono text-xs text-sable/50 uppercase">Marque</label>
          <input
            value={form.marque}
            onChange={set("marque")}
            className="w-full mt-1 bg-charbon-soft border border-charbon-line rounded-sm px-4 py-3 text-sable"
          />
        </div>
        <div>
          <label className="font-mono text-xs text-sable/50 uppercase">Poids / Format</label>
          <input
            value={form.poids}
            onChange={set("poids")}
            className="w-full mt-1 bg-charbon-soft border border-charbon-line rounded-sm px-4 py-3 text-sable"
          />
        </div>
      </div>

      <div>
        <label className="font-mono text-xs text-sable/50 uppercase">Catégorie</label>
        <select
          required
          value={form.categoryId}
          onChange={set("categoryId")}
          className="w-full mt-1 bg-charbon-soft border border-charbon-line rounded-sm px-4 py-3 text-sable"
        >
          <option value="">-- Choisir --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 font-body text-sable/70">
        <input
          type="checkbox"
          checked={form.disponible}
          onChange={(e) => setForm((f) => ({ ...f, disponible: e.target.checked }))}
        />
        Visible sur la boutique
      </label>

      {erreur && <p className="text-braise font-body text-sm">{erreur}</p>}

      <button
        type="submit"
        disabled={envoi || uploadEnCours}
        className="bg-braise text-charbon font-semibold py-3 rounded-sm hover:bg-braise-light transition-colors disabled:opacity-50"
      >
        {envoi ? "Enregistrement..." : produit ? "Enregistrer les modifications" : "Créer le produit"}
      </button>
    </form>
  );
}
