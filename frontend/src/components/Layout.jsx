import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/', label: 'Ordens de serviço', end: true },
  { to: '/clientes', label: 'Clientes' },
  { to: '/veiculos', label: 'Veículos' },
];

export default function Layout() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="marca">
          <span className="marca-icone" aria-hidden="true">⚙</span>
          <span>OficinaPro</span>
        </div>
        <nav className="nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'ativo' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="conteudo">
        <Outlet />
      </main>
    </div>
  );
}
