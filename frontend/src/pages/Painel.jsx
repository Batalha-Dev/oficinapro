import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, STATUS_LABEL, PROXIMOS, moeda, data, formatarPlaca } from '../api/client.js';
import { useRecurso } from '../api/useRecurso.js';
import { Carregando, Erro, Aviso } from '../components/Estado.jsx';
import Modal from '../components/Modal.jsx';
import { filtrarOrdens, podeSoltar } from '../lib/kanban.js';

const COLUNAS = ['ABERTA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA'];
const ACAO = { EM_ANDAMENTO: 'Iniciar', CONCLUIDA: 'Concluir', CANCELADA: 'Cancelar' };

export default function Painel() {
  const { dados: ordens, carregando, erro, recarregar } = useRecurso('/ordens');
  const resumo = useRecurso('/resumo');
  const [aviso, setAviso] = useState(null);
  const [novaAberta, setNovaAberta] = useState(false);
  const [busca, setBusca] = useState('');
  const [arrastando, setArrastando] = useState(null); // OS sendo arrastada
  const [alvo, setAlvo] = useState(null); // coluna sob o cursor

  async function mudarStatus(ordem, status) {
    if (status === 'CANCELADA' && !confirm(`Cancelar a OS #${ordem.id}?`)) return;
    setAviso(null);
    try {
      await api.patch(`/ordens/${ordem.id}/status`, { status });
      recarregar();
      resumo.recarregar();
    } catch (e) {
      setAviso(e.message);
    }
  }

  function soltar(status) {
    const ordem = arrastando;
    setArrastando(null);
    setAlvo(null);
    if (ordem && podeSoltar(ordem.status, status)) mudarStatus(ordem, status);
  }

  const visiveis = ordens ? filtrarOrdens(ordens, busca) : null;

  return (
    <section>
      <div className="cabecalho">
        <div>
          <h1>Ordens de serviço</h1>
          <p className="sub">Acompanhe cada carro do diagnóstico à entrega.</p>
        </div>
        <button className="btn btn-primario" onClick={() => setNovaAberta(true)}>
          + Nova OS
        </button>
      </div>
      <Aviso mensagem={aviso} onFechar={() => setAviso(null)} />

      {resumo.dados && (
        <div className="kpis" aria-label="Números do mês">
          <div className="kpi">
            <span className="kpi-rotulo">Faturamento do mês</span>
            <strong className="kpi-valor">{moeda(resumo.dados.faturamentoMes)}</strong>
          </div>
          <div className="kpi">
            <span className="kpi-rotulo">Concluídas no mês</span>
            <strong className="kpi-valor">{resumo.dados.concluidasNoMes}</strong>
          </div>
          <div className="kpi">
            <span className="kpi-rotulo">Ticket médio</span>
            <strong className="kpi-valor">{moeda(resumo.dados.ticketMedio)}</strong>
          </div>
          <div className="kpi">
            <span className="kpi-rotulo">Na oficina agora</span>
            <strong className="kpi-valor">{resumo.dados.porStatus.ABERTA + resumo.dados.porStatus.EM_ANDAMENTO}</strong>
          </div>
        </div>
      )}

      <div className="barra-busca">
        <input
          type="search"
          placeholder="Buscar por placa, cliente, modelo ou problema…"
          aria-label="Buscar ordens de serviço"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <span className="dica-arrastar">Arraste um card para mudar o status</span>
      </div>

      {carregando && !ordens && <Carregando />}
      {erro && <Erro mensagem={erro} onTentar={recarregar} />}

      {visiveis && (
        <div className="kanban">
          {COLUNAS.map((status) => {
            const lista = visiveis.filter((o) => o.status === status);
            const valida = arrastando && podeSoltar(arrastando.status, status);
            const classes = ['coluna', `coluna-${status.toLowerCase()}`];
            if (arrastando) classes.push(valida ? 'coluna-aceita' : 'coluna-bloqueada');
            if (alvo === status && valida) classes.push('coluna-alvo');
            return (
              <div
                key={status}
                className={classes.join(' ')}
                onDragOver={(e) => {
                  if (!valida) return;
                  e.preventDefault(); // permite soltar
                  setAlvo(status);
                }}
                onDragLeave={() => setAlvo((a) => (a === status ? null : a))}
                onDrop={(e) => {
                  e.preventDefault();
                  soltar(status);
                }}
              >
                <div className="coluna-topo">
                  <span className="ponto" aria-hidden="true" />
                  <h2>{STATUS_LABEL[status]}</h2>
                  <span className="contador">{lista.length}</span>
                </div>
                {lista.length === 0 && (
                  <p className="coluna-vazia">{busca ? 'Nada encontrado.' : 'Nenhuma OS aqui.'}</p>
                )}
                {lista.map((o) => (
                  <article
                    key={o.id}
                    className={`card-os ${arrastando?.id === o.id ? 'card-arrastando' : ''}`}
                    draggable={PROXIMOS[o.status].length > 0}
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', String(o.id));
                      setArrastando(o);
                    }}
                    onDragEnd={() => {
                      setArrastando(null);
                      setAlvo(null);
                    }}
                  >
                    <Link to={`/ordens/${o.id}`} className="card-link">
                      <div className="card-linha">
                        <span className="placa">{formatarPlaca(o.veiculo.placa)}</span>
                        <span className="os-num">#{o.id}</span>
                      </div>
                      <p className="card-desc">{o.descricaoProblema}</p>
                      <p className="card-meta">
                        {o.veiculo.marca} {o.veiculo.modelo} · {o.veiculo.cliente.nome}
                      </p>
                      <div className="card-linha">
                        <span className="card-meta">{data(o.abertaEm)}</span>
                        <strong className="valor">{moeda(o.valorTotal)}</strong>
                      </div>
                    </Link>
                    {PROXIMOS[o.status].length > 0 && (
                      <div className="card-acoes">
                        {PROXIMOS[o.status].map((s) => (
                          <button
                            key={s}
                            className={`btn btn-sm ${s === 'CANCELADA' ? 'btn-fantasma' : ''}`}
                            onClick={() => mudarStatus(o, s)}
                          >
                            {ACAO[s]}
                          </button>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {novaAberta && (
        <NovaOS
          onFechar={() => setNovaAberta(false)}
          onCriada={() => {
            setNovaAberta(false);
            recarregar();
            resumo.recarregar();
          }}
        />
      )}
    </section>
  );
}

function NovaOS({ onFechar, onCriada }) {
  const { dados: veiculos, carregando, erro } = useRecurso('/veiculos');
  const [form, setForm] = useState({ veiculoId: '', descricaoProblema: '' });
  const [falha, setFalha] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    setFalha(null);
    try {
      await api.post('/ordens', form);
      onCriada();
    } catch (err) {
      setFalha(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal titulo="Nova ordem de serviço" onFechar={onFechar}>
      {carregando && <Carregando />}
      {erro && <Erro mensagem={erro} />}
      {veiculos && veiculos.length === 0 && (
        <p>
          Cadastre um veículo antes de abrir uma OS. <Link to="/veiculos">Ir para veículos</Link>
        </p>
      )}
      {veiculos && veiculos.length > 0 && (
        <form className="form" onSubmit={enviar}>
          <label>
            Veículo
            <select required value={form.veiculoId} onChange={(e) => setForm({ ...form, veiculoId: e.target.value })}>
              <option value="">Selecione…</option>
              {veiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {formatarPlaca(v.placa)} — {v.marca} {v.modelo} ({v.cliente.nome})
                </option>
              ))}
            </select>
          </label>
          <label>
            Problema relatado
            <textarea
              required
              minLength={3}
              rows={3}
              value={form.descricaoProblema}
              onChange={(e) => setForm({ ...form, descricaoProblema: e.target.value })}
              placeholder="Ex.: barulho ao frear"
            />
          </label>
          {falha && <p className="erro-form">{falha}</p>}
          <div className="form-acoes">
            <button type="button" className="btn btn-fantasma" onClick={onFechar}>
              Cancelar
            </button>
            <button className="btn btn-primario" disabled={enviando}>
              {enviando ? 'Salvando…' : 'Abrir OS'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
