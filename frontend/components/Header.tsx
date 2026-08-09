"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { nombreArticles } = useCart();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-charbon/95 backdrop-blur border-b border-charbon-line">
      <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between h-16">
        <Link href="/" className="font-display text-2xl tracking-wide text-sable">
          CREATINE<span className="text-braise">.SN</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 font-body text-sm text-sable/80">
          <Link href="/produits" className="hover:text-braise transition-colors">
            Tous les produits
          </Link>
          <Link href="/categorie/creatine" className="hover:text-braise transition-colors">
            Créatine
          </Link>
          <Link href="/categorie/proteines" className="hover:text-braise transition-colors">
            Protéines
          </Link>
          <Link href="/categorie/pre-workout" className="hover:text-braise transition-colors">
            Pré-workout
          </Link>
        </nav>

        <div className="flex items-center gap-4 font-body text-sm">
          {user ? (
            <div className="hidden md:flex items-center gap-3 text-sable/80">
              <Link href="/compte" className="hover:text-braise transition-colors">
                {user.prenom}
              </Link>
              {user.role === "ADMIN" && (
                <Link href="/admin" className="text-cobalt hover:text-cobalt-dim">
                  Admin
                </Link>
              )}
              <button onClick={logout} className="hover:text-braise transition-colors">
                Déconnexion
              </button>
            </div>
          ) : (
            <Link href="/connexion" className="hidden md:block text-sable/80 hover:text-braise">
              Connexion
            </Link>
          )}

          <Link
            href="/panier"
            className="relative flex items-center justify-center w-10 h-10 rounded-sm border border-charbon-line hover:border-braise transition-colors"
            aria-label="Voir le panier"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {nombreArticles > 0 && (
              <span className="absolute -top-2 -right-2 bg-braise text-charbon text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {nombreArticles}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
