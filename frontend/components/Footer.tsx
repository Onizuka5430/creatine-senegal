export default function Footer() {
  return (
    <footer className="border-t border-charbon-line mt-24">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="font-display text-xl text-sable mb-3">
            CREATINE<span className="text-braise">.SN</span>
          </div>
          <p className="text-sable/60 font-body">
            Compléments alimentaires livrés partout au Sénégal. Dosage précis, résultats mesurables.
          </p>
        </div>
        <div>
          <h4 className="text-sable font-semibold mb-3">Boutique</h4>
          <ul className="space-y-2 text-sable/60 font-body">
            <li>Créatine</li>
            <li>Protéines</li>
            <li>Pré-workout</li>
            <li>Accessoires</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sable font-semibold mb-3">Livraison</h4>
          <ul className="space-y-2 text-sable/60 font-body">
            <li>Dakar</li>
            <li>Thiès</li>
            <li>Saint-Louis</li>
            <li>Kaolack</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sable font-semibold mb-3">Paiement</h4>
          <ul className="space-y-2 text-sable/60 font-body">
            <li>Wave</li>
            <li>Orange Money</li>
            <li>Carte bancaire</li>
            <li>À la livraison</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-charbon-line py-6 text-center text-xs text-sable/40 font-body">
        © {new Date().getFullYear()} Creatine Sénégal — Projet de démonstration.
      </div>
    </footer>
  );
}
