import { useState } from 'react';
import Crud, { AcoesForm } from '../components/Crud.jsx';

const colunas = [
  { titulo: 'Nome', render: (c) => c.nome },
  { titulo: 'Telefone', render: (c) => c.telefone },
  { titulo: 'E-mail', render: (c) => c.email || '—' },
  { titulo: 'Veículos', render: (c) => c._count?.veiculos ?? 0 },
];

function FormCliente({ inicial, onSalvar, onCancelar, falha, enviando }) {
  const [f, setF] = useState({
    nome: inicial.nome || '',
    telefone: inicial.telefone || '',
    email: inicial.email || '',
    cpf: inicial.cpf || '',
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
        Nome
        <input required minLength={2} autoFocus {...campo('nome')} />
      </label>
      <label>
        Telefone
        <input required minLength={8} placeholder="(49) 99999-0000" {...campo('telefone')} />
      </label>
      <div className="form-duplo">
        <label>
          E-mail <span className="opcional">opcional</span>
          <input type="email" {...campo('email')} />
        </label>
        <label>
          CPF <span className="opcional">opcional</span>
          <input inputMode="numeric" placeholder="000.000.000-00" {...campo('cpf')} />
        </label>
      </div>
      <AcoesForm onCancelar={onCancelar} enviando={enviando} falha={falha} />
    </form>
  );
}

export default function Clientes() {
  return (
    <Crud
      titulo="Clientes"
      subtitulo="Quem confia o carro à oficina."
      recurso="clientes"
      nomeItem="cliente"
      colunas={colunas}
      rotulo={(c) => c.nome}
      Formulario={FormCliente}
      vazio="Nenhum cliente cadastrado ainda."
    />
  );
}
