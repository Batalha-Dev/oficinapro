// Estados padrão de tela: carregando, erro (com tentar de novo) e vazio.
export function Carregando() {
  return (
    <div className="estado" role="status">
      <span className="spinner" aria-hidden="true" /> Carregando…
    </div>
  );
}

export function Erro({ mensagem, onTentar }) {
  return (
    <div className="estado estado-erro" role="alert">
      <p>{mensagem}</p>
      {onTentar && (
        <button className="btn" onClick={onTentar}>
          Tentar de novo
        </button>
      )}
    </div>
  );
}

export function Vazio({ children }) {
  return <div className="estado estado-vazio">{children}</div>;
}

export function Aviso({ mensagem, onFechar }) {
  if (!mensagem) return null;
  return (
    <div className="aviso" role="alert">
      <span>{mensagem}</span>
      <button className="btn-icone" onClick={onFechar} aria-label="Fechar aviso">
        ×
      </button>
    </div>
  );
}
