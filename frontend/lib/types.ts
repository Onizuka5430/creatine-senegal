export type Category = {
  id: string;
  nom: string;
  slug: string;
  description?: string | null;
  _count?: { produits: number };
};

export type Product = {
  id: string;
  nom: string;
  slug: string;
  description: string;
  ingredients?: string | null;
  dosage?: string | null;
  prix: number;
  promotion?: number | null;
  poids?: string | null;
  marque?: string | null;
  stock: number;
  photo?: string | null;
  disponible: boolean;
  category?: Category;
  avis?: Review[];
};

export type Review = {
  id: string;
  note: number;
  commentaire?: string | null;
  user?: { prenom: string };
};

export type User = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  adresse?: string | null;
  ville?: string | null;
  role: "CLIENT" | "ADMIN";
};

export type CartItem = {
  productId: string;
  nom: string;
  prix: number; // prix unitaire déjà remisé
  photo?: string | null;
  quantite: number;
  stock: number;
};

export type Order = {
  id: string;
  total: number;
  fraisLivraison: number;
  statut: string;
  ville: string;
  adresse: string;
  modePaiement: string;
  dateCreation: string;
  items: { quantite: number; prix: number; product: Product }[];
};
