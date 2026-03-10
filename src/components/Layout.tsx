import { Link, NavLink } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

const links = [
  ['/', 'Panoramica'],
  ['/dice', 'Tiri di dado'],
  ['/creatures', 'Creature'],
  ['/import', 'Importa'],
  ['/settings', 'Impostazioni']
];

export function Layout({ children }: PropsWithChildren) {
  return (
    <div className="mx-auto max-w-6xl p-4">
      <a href="#main-content" className="skip-link">Salta al contenuto</a>
      <header className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Link to="/" className="text-xl font-semibold">PF2e Combat Assistant</Link>
        <nav className="flex flex-wrap gap-2 text-sm" aria-label="Navigazione principale">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `rounded px-2 py-1 ${isActive ? 'bg-slate-700' : 'bg-slate-800'}`}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
