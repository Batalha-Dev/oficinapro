import { useState } from 'react';
import { api } from '../api/client.js';
import { useRecurso } from '../api/useRecurso.js';
import { Carregando, Erro, Vazio, Aviso } from './Estado.jsx';
import Modal from './Modal.jsx';

/**
 * Tela genérica de cadastro (lista + criar/editar/excluir), reaproveitada
 * por Clientes e Veículos para não duplicar estados e chamadas à API.
 *
 * colunas: [{ titulo, render(item) }]
 * Formulario: componente ({ inicial, onSalvar, onCancelar, falha, enviando })
 */
export default function Crud({ titulo, subtitulo, recurso, nomeItem, colunas, rotulo, Formulario, vazio }) {
  const { dados, carregando, erro, recarregar } = useRecurso(`/${recurso}`);
  const [editando, setEditando] = useState(null); // null fechado, {} novo, item edição
  const [falha, setFalha] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState(null);

  async function salvar(valores) {
    setEnviando(true);
    setFalha(null);
    setAviso(null);
    try {
      if (editando.id) await api.put(`/${recurso}/${editando.id}`, valores);
      else await api.post(`/${recurso}`, valores);
      setEditando(null);
      recarregar();
    } catch (e) {
      setFalha(e.message);
    } finally {
      setEnviando(false);
    }
  }

  async function excluir(item) {
    if (!confirm(`Excluir ${nomeItem} "${item.rotulo}"?`)) return;
    setAviso(null);
    try {
      await api.del(`/${recurso}/${item.id}`);
      recarregar();
    } catch (e) {
      setAviso(e.message);
    }
  }

  const abrir = (item) => {
    setFalha(null);
    setEditando(item);
  };

  return (
    <section>
      <div className="cabecalho">
        <div>
          <h1>{titulo}</h1>
          <p className="sub">{subtitulo}</p>
        </div>
        <button className="btn btn-primario" onClick={() => abrir({})}>
          + Novo {nomeItem}
        </button>
      </div>
      <Aviso mensagem={aviso} onFechar={() => setAviso(null)} />

      {carregando && !dados && <Carregando />}
      {erro && <Erro mensagem={erro} onTentar={recarregar} />}
      {dados && dados.length === 0 && <Vazio>{vazio}</Vazio>}
      {dados && dados.length > 0 && (
        <div className="tabela-wrap">
          <table className="tabela">
            <thead>
              <tr>
                {colunas.map((c) => (
                  <th key={c.titulo}>{c.titulo}</th>
                ))}
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {dados.map((item) => (
                <tr key={item.id}>
                  {colunas.map((c) => (
                    <td key={c.titulo} data-titulo={c.titulo}>
                      {c.render(item)}
                    </td>
                  ))}
                  <td className="acoes">
                    <button className="btn btn-sm" onClick={() => abrir(item)}>
                      Editar
                    </button>
                    <button className="btn btn-sm btn-fantasma" onClick={() => excluir({ ...item, rotulo: rotulo(item) })}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editando && (
        <Modal titulo={editando.id ? `Editar ${nomeItem}` : `Novo ${nomeItem}`} onFechar={() => setEditando(null)}>
          <Formulario inicial={editando} onSalvar={salvar} onCancelar={() => setEditando(null)} falha={falha} enviando={enviando} />
        </Modal>
      )}
    </section>
  );
}

export function AcoesForm({ onCancelar, enviando, falha }) {
  return (
    <>
      {falha && <p className="erro-form">{falha}</p>}
      <div className="form-acoes">
        <button type="button" className="btn btn-fantasma" onClick={onCancelar}>
          Cancelar
        </button>
        <button className="btn btn-primario" disabled={enviando}>
          {enviando ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </>
  );
}
