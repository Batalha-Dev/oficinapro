import { useState } from 'react';
import Crud, { AcoesForm } from '../components/Crud.jsx';
import { useRecurso } from '../api/useRecurso.js';
import { formatarPlaca } from '../api/client.js';

const colunas = [
  { titulo: 'Placa', render: (v) => <span className="placa">{formatarPlaca(v.placa)}</span> },
  { titulo: 'Veículo', render: (v) => `${v.marca} ${v.modelo}` },
  { titulo: 'Ano', render: (v) => v.ano },
  { titulo: 'Cliente', render: (v) => v.cliente.nome },
  { titulo: 'OS', render: (v) => v._count?.ordens ?? 0 },
];

function FormVeiculo({ inicial, onSalvar, onCancelar, falha, enviando }) {
  const { dados: clientes } = useRecurso('/clientes');
  const [f, setF] = useState({
    placa: inicial.placa || '',
    marca: inicial.marca || '',
    modelo: inicial.modelo || '',
    ano: inicial.ano || '',
    clienteId: inicial.clienteId || '',
  });
  const campo = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) });

  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        onSalvar(f);
      }}
    >
      <label>
        Cliente
        <select required {...campo('clienteId')}>
          <option value="">Selecione…</option>
          {clientes?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </label>
      <div className="form-duplo">
        <label>
          Placa
          <input required placeholder="ABC1D23" maxLength={8} autoFocus style={{ textTransform: 'uppercase' }} {...campo('placa')} />
        </label>
        <label>
          Ano
          <input required type="number" min={1950} max={new Date().getFullYear() + 1} {...campo('ano')} />
        </label>
      </div>
      <div className="form-duplo">
        <label>
          Marca
          <input required {...campo('marca')} />
        </label>
        <label>
          Modelo
          <input required {...campo('modelo')} />
        </label>
      </div>
      <AcoesForm onCancelar={onCancelar} enviando={enviando} falha={falha} />
    </form>
  );
}

export default function Veiculos() {
  return (
    <Crud
      titulo="Veículos"
      subtitulo="Placas antigas e Mercosul são aceitas."
      recurso="veiculos"
      nomeItem="veículo"
      colunas={colunas}
      Formulario={FormVeiculo}
      vazio="Nenhum veículo cadastrado. Cadastre um cliente primeiro."
    />
  );
}
