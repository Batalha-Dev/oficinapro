import { Link, useParams } from 'react-router-dom';
import { STATUS_LABEL, moeda, data, formatarPlaca } from '../api/client.js';
import { useRecurso } from '../api/useRecurso.js';
import { Carregando, Erro, Vazio } from '../components/Estado.jsx';

export default function VeiculoHistorico() {
  const { id } = useParams();
  const veiculo = useRecurso(`/veiculos/${id}`);
  const ordens = useRecurso(`/ordens?veiculoId=${id}`);

  if (veiculo.carregando && !veiculo.dados) return <Carregando />;
  if (veiculo.erro) return <Erro mensagem={veiculo.erro} onTentar={veiculo.recarregar} />;
  if (!veiculo.dados) return null;

  const v = veiculo.dados;
  const lista = ordens.dados ?? [];
  const gasto = lista.filter((o) => o.status === 'CONCLUIDA').reduce((s, o) => s + o.valorTotal, 0);

  return (
    <section>
      <Link to="/veiculos" className="voltar">
        ← Voltar aos veículos
      </Link>
      <div className="cabecalho">
        <div>
          <h1>
            <span className="placa placa-grande">{formatarPlaca(v.placa)}</span>
          </h1>
          <p className="sub">
            {v.marca} {v.modelo} · {v.ano} · {v.cliente.nome}
          </p>
        </div>
        <div className="kpi kpi-compacto">
          <span className="kpi-rotulo">Total em serviços concluídos</span>
          <strong className="kpi-valor">{moeda(gasto)}</strong>
        </div>
      </div>

      {ordens.carregando && !ordens.dados && <Carregando />}
      {ordens.erro && <Erro mensagem={ordens.erro} onTentar={ordens.recarregar} />}
      {ordens.dados && lista.length === 0 && <Vazio>Este veículo ainda não passou pela oficina.</Vazio>}
      {lista.length > 0 && (
        <ol className="linha-tempo">
          {lista.map((o) => (
            <li key={o.id} className={`marco marco-${o.status.toLowerCase()}`}>
              <Link to={`/ordens/${o.id}`} className="marco-cartao">
                <div className="card-linha">
                  <span className="os-num">#{o.id}</span>
                  <span className={`badge badge-${o.status.toLowerCase()}`}>{STATUS_LABEL[o.status]}</span>
                </div>
                <p className="card-desc">{o.descricaoProblema}</p>
                <div className="card-linha">
                  <span className="card-meta">
                    Aberta em {data(o.abertaEm)}
                    {o.concluidaEm && ` · concluída em ${data(o.concluidaEm)}`}
                  </span>
                  <strong className="valor">{moeda(o.valorTotal)}</strong>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
