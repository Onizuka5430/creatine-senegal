// Élément signature de la marque : une jauge circulaire qui matérialise
// "combien de la dose journalière ce produit représente" — un rappel visuel
// constant que Creatine Senegal vend de la précision, pas juste des boîtes.
export default function DosageGauge({
  label,
  pourcentage = 100,
  size = 56,
}: {
  label: string;
  pourcentage?: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="dosage-gauge rounded-full flex items-center justify-center"
        style={
          {
            width: size,
            height: size,
            "--pct": `${Math.min(pourcentage, 100)}%`,
          } as React.CSSProperties
        }
      >
        <div className="bg-charbon rounded-full flex items-center justify-center w-[76%] h-[76%]">
          <span className="font-mono text-[10px] text-sable">{label}</span>
        </div>
      </div>
    </div>
  );
}
