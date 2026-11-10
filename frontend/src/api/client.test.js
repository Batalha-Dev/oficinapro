import { describe, expect, test, vi } from 'vitest';
import { api, sessao, formatarPlaca, moeda } from './client.js';

const resposta = (status, corpo) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(corpo) });

describe('formatadores', () => {
  test('placa antiga ganha hífen; Mercosul fica igual', () => {
    expect(formatarPlaca('ABC1234')).toBe('ABC-1234');
    expect(formatarPlaca('ABC1D23')).toBe('ABC1D23');
  });
  test('moeda em reais', () => {
    expect(moeda(1234.5).replace(/\s/g, ' ')).toBe('R$ 1.234,50');
  });
});

describe('cliente da API', () => {
  test('envia o token salvo no cabeçalho Authorization', async () => {
    sessao.salvar({ token: 'abc', usuario: { nome: 'X' } });
    const fetch = vi.spyOn(globalThis, 'fetch').mockReturnValue(resposta(200, []));
    await api.get('/clientes');
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer abc');
  });

  test('usa as mensagens de validação do servidor como erro', async () => {
    vi.spyOn(globalThis, 'fetch').mockReturnValue(
      resposta(400, { erro: 'Dados inválidos', detalhes: [{ mensagem: 'Placa inválida' }] })
    );
    await expect(api.post('/veiculos', {})).rejects.toThrow('Placa inválida');
  });

  test('401 limpa a sessão e avisa o app', async () => {
    sessao.salvar({ token: 'velho' });
    const ouvinte = vi.fn();
    window.addEventListener('oficinapro:sessao-expirada', ouvinte);
    vi.spyOn(globalThis, 'fetch').mockReturnValue(resposta(401, { erro: 'Sessão expirada' }));
    await expect(api.get('/ordens')).rejects.toThrow('Sessão expirada');
    expect(sessao.ler()).toBeNull();
    expect(ouvinte).toHaveBeenCalledOnce();
  });

  test('falha de rede vira mensagem amigável', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(api.get('/ordens')).rejects.toThrow(/backend está rodando/);
  });
});
