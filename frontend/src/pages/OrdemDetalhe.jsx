import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, STATUS_LABEL, PROXIMOS, moeda, data, formatarPlaca } from '../api/client.js';
import { useRecurso } from '../api/useRecurso.js';
import { Carregando, Erro, Aviso } from '../components/Estado.jsx';

const ACAO = { EM_ANDAMENTO: 'Iniciar serviço', CONCLUIDA: 'Concluir', CANCELADA: 'Cancelar OS' };
const ITEM_VAZIO = { descricao: '', quantidade: 1, valorUnitario: '' };

export default function OrdemDetalhe() {
  const { id } = useParams();
  const { dados: os, carregando, erro, recarregar } = useRecurso(`/ordens/${id}`);
  const [item, setItem] = useState(ITEM_VAZIO);
  const [aviso, setAviso] = useState(null);

  async function executar(fn) {
    setAviso(null);
    try {
      await fn();
      recarregar();
    } catch (e) {
      setAviso(e.message);
    }
  }

  if (carregando && !os) return <Carregando />;
  if (erro) return <Erro mensagem={erro} onTentar={recarregar} />;
  if (!os) return null;

  const fechada = PROXIMOS[os.status].length === 0;

  return (
    <section>
      <Link to="/" className="voltar">
        ← Voltar ao quadro
      </Link>
      <div className="cabecalho">
        <div>
          <h1>
            OS #{os.id} <span className={`badge badge-${os.status.toLowerCase()}`}>{STATUS_LABEL[os.status]}</span>
          </h1>
          <p className="sub">{os.descricaoProblema}</p>
        </div>
        <div className="card-acoes">
          {PROXIMOS[os.status].map((s) => (
            <button
              key={s}
              className={`btn ${s === 'CANCELADA' ? 'btn-fantasma' : 'btn-primario'}`}
              onClick={() =>
                (s !== 'CANCELADA' || confirm('Cancelar esta OS?')) &&
                executar(() => api.patch(`/ordens/${os.id}/status`, { status: s }))
              }
            >
              {ACAO[s]}
            </button>
          ))}
        </div>
      </div>
      <Aviso mensagem={aviso} onFechar={() => setAviso(null)} />

      <div className="detalhe-grid">
        <div className="painel">
          <h2>Veículo</h2>
          <p className="placa placa-grande">{formatarPlaca(os.veiculo.placa)}</p>
          <p>
            {os.veiculo.marca} {os.veiculo.modelo} · {os.veiculo.ano}
          </p>
          <h2>Cliente</h2>
          <p>{os.veiculo.cliente.nome}</p>
          <p className="card-meta">{os.veiculo.cliente.telefone}</p>
          <h2>Datas</h2>
          <p className="card-meta">Aberta em {data(os.abertaEm)}</p>
          {os.concluidaEm && <p className="card-meta">Concluída em {data(os.concluidaEm)}</p>}
        </div>

        <div className="painel">
          <h2>Peças e serviços</h2>
          {os.itens.length === 0 && <p className="coluna-vazia">Nenhum item lançado.</p>}
          {os.itens.length > 0 && (
            <table className="tabela tabela-itens">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Qtd</th>
                  <th>Unitário</th>
                  <th>Subtotal</th>
                  {!fechada && <th aria-label="Ações" />}
                </tr>
              </thead>
              <tbody>
                {os.itens.map((i) => (
                  <tr key={i.id}>
                    <td data-titulo="Descrição">{i.descricao}</td>
                    <td data-titulo="Qtd">{i.quantidade}</td>
                    <td data-titulo="Unitário">{moeda(i.valorUnitario)}</td>
                    <td data-titulo="Subtotal">{moeda(i.valorUnitario * i.quantidade)}</td>
                    {!fechada && (
                      <td className="acoes">
                        <button
                          className="btn btn-sm btn-fantasma"
                          onClick={() => executar(() => api.del(`/ordens/${os.id}/itens/${i.id}`))}
                        >
                          Remover
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="total">
            <span>Total</span>
            <strong>{moeda(os.valorTotal)}</strong>
          </div>

          {!fechada && (
            <form
              className="form form-item"
              onSubmit={(e) => {
                e.preventDefault();
                executar(async () => {
                  await api.post(`/ordens/${os.id}/itens`, item);
                  setItem(ITEM_VAZIO);
                });
              }}
            >
              <input
                required
                placeholder="Peça ou serviço"
                value={item.descricao}
                onChange={(e) => setItem({ ...item, descricao: e.target.value })}
              />
              <input
                required
                type="number"
                min={1}
                aria-label="Quantidade"
                value={item.quantidade}
                onChange={(e) => setItem({ ...item, quantidade: e.target.value })}
              />
              <input
                required
                type="number"
                min={0}
                step="0.01"
                placeholder="Valor R$"
                aria-label="Valor unitário"
                value={item.valorUnitario}
                onChange={(e) => setItem({ ...item, valorUnitario: e.target.value })}
              />
              <button className="btn btn-primario">Adicionar</button>
            </form>
          )}
          {fechada && <p className="card-meta">OS finalizada: itens não podem mais ser alterados.</p>}
        </div>
      </div>
    </section>
  );
}
