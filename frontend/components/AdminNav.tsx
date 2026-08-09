"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LIENS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/produits", label: "Produits" },
  { href: "/admin/commandes", label: "Commandes" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 mb-8 border-b border-charbon-line pb-4">
      {LIENS.map((l) => {
        const actif = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`px-4 py-2 rounded-sm font-body text-sm transition-colors ${
              actif
                ? "bg-braise text-charbon font-semibold"
                : "text-sable/60 hover:text-sable border border-charbon-line"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
