export default function Header({ activePage = 'home' }) {
  const navLinks = [
    { href: '/', label: 'Compare', key: 'compare' },
    { href: '#', label: 'Budget', key: 'budget' },
    { href: '#', label: 'Inventory', key: 'inventory' },
  ]

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant/30">
      <nav className="flex justify-between items-center h-20 px-margin max-w-[1280px] mx-auto w-full">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-primary text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            directions_car
          </span>
          <div className="font-display-lg text-[22px] font-extrabold text-on-surface">
            Car Recommender
          </div>
        </div>

        <div className="hidden md:flex items-center gap-xl">
          {navLinks.map(({ href, label, key }) => (
            <a
              key={key}
              href={href}
              className={
                activePage === key
                  ? 'text-primary font-bold text-body-md relative after:content-[\'\'] after:absolute after:-bottom-[26px] after:left-0 after:right-0 after:h-1 after:bg-primary after:rounded-full'
                  : 'text-on-surface-variant hover:text-primary transition-colors font-medium text-body-md'
              }
            >
              {label}
            </a>
          ))}
        </div>

        <a
          href="/"
          className="bg-primary text-on-primary px-lg py-sm rounded-full font-label-caps text-label-caps hover:bg-primary-container transition-all shadow-md shadow-primary/20"
        >
          Get Started
        </a>
      </nav>
    </header>
  )
}
