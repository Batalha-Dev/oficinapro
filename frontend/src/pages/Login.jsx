import { useState } from 'react';
import { api, sessao } from '../api/client.js';

export default function Login({ onEntrar }) {
  const [form, setForm] = useState({ email: '', senha: '' });
  const [falha, setFalha] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    setFalha(null);
    try {
      const dados = await api.post('/auth/login', form);
      sessao.salvar(dados);
      onEntrar(dados);
    } catch (err) {
      setFalha(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="login">
      <div className="login-faixa" aria-hidden="true" />
      <form className="login-cartao form" onSubmit={enviar}>
        <div className="login-marca">
          <span className="marca-icone" aria-hidden="true">
            <svg
              width="20"
              height="20"
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
          <h1>OficinaPro</h1>
        </div>
        <p className="sub">Entre para abrir a oficina.</p>
        <label>
          E-mail
          <input
            type="email"
            required
            autoFocus
            autoComplete="username"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            required
            autoComplete="current-password"
            value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
          />
        </label>
        {falha && (
          <p className="erro-form" role="alert">
            {falha}
          </p>
        )}
        <button className="btn btn-primario btn-largo" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
