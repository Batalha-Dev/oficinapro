import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/', label: 'Ordens de serviço', end: true },
  { to: '/clientes', label: 'Clientes' },
  { to: '/veiculos', label: 'Veículos' },
];

export default function Layout({ usuario, onSair }) {
  return (
    <div className="app">
      <header className="topbar">
        <div className="marca">
          <span className="marca-icone" aria-hidden="true">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z" />
            </svg>
          </span>
          <span>OficinaPro</span>
        </div>
        <nav className="nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'ativo' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="usuario">
          <span className="usuario-nome">{usuario?.nome}</span>
          <button className="btn btn-sm btn-sair" onClick={onSair}>
            Sair
          </button>
        </div>
      </header>
      <main className="conteudo">
        <Outlet />
      </main>
    </div>
  );
}
