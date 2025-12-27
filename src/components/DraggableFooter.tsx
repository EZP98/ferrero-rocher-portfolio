export function DraggableFooter() {
  return (
    <footer className="relative z-30 bg-[#0d0906] py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Decorative line */}
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-gold)]/30 to-transparent mb-12" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Brand */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold gradient-text mb-2">Ferrero Rocher</h3>
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} Ferrero SpA. Tutti i diritti riservati.
            </p>
          </div>

          {/* Info */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/50 text-sm">
            <span>Alba, Piemonte</span>
            <span className="hidden md:inline text-[var(--color-gold)]">•</span>
            <span>Dal 1982</span>
            <span className="hidden md:inline text-[var(--color-gold)]">•</span>
            <span>Made in Italy</span>
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="mt-12 text-center">
          <p className="text-white/20 text-xs uppercase tracking-[0.3em]">
            Un momento di puro piacere
          </p>
        </div>
      </div>
    </footer>
  )
}
