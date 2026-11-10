import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login.jsx';
import { sessao } from '../api/client.js';

const resposta = (status, corpo) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(corpo) });

async function preencher() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('E-mail'), 'mecanico@oficinapro.com');
  await user.type(screen.getByLabelText('Senha'), 'qualquer');
  await user.click(screen.getByRole('button', { name: 'Entrar' }));
}

describe('<Login />', () => {
  test('login certo salva a sessão e avisa o App', async () => {
    const dados = { token: 't1', usuario: { id: 1, nome: 'Mecânico' } };
    vi.spyOn(globalThis, 'fetch').mockReturnValue(resposta(200, dados));
    const onEntrar = vi.fn();
    render(<Login onEntrar={onEntrar} />);
    await preencher();
    expect(onEntrar).toHaveBeenCalledWith(dados);
    expect(sessao.ler().token).toBe('t1');
  });

  test('login errado mostra a mensagem do servidor e não entra', async () => {
    vi.spyOn(globalThis, 'fetch').mockReturnValue(resposta(401, { erro: 'E-mail ou senha incorretos' }));
    const onEntrar = vi.fn();
    render(<Login onEntrar={onEntrar} />);
    await preencher();
    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha incorretos');
    expect(onEntrar).not.toHaveBeenCalled();
  });
});
