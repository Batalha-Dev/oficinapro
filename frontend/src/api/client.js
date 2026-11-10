// Único ponto de acesso à API: padroniza JSON, token, erros e mensagens do servidor.
const CHAVE_SESSAO = 'oficinapro.sessao';

export const sessao = {
  ler() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE_SESSAO));
    } catch {
      return null;
    }
  },
  salvar(dados) {
    try {
      localStorage.setItem(CHAVE_SESSAO, JSON.stringify(dados));
    } catch {
      /* navegador sem storage: a sessão dura só esta aba */
    }
  },
  limpar() {
    try {
      localStorage.removeItem(CHAVE_SESSAO);
    } catch {
      /* idem */
    }
  },
};

async function request(method, path, body) {
  const token = sessao.ler()?.token;
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error('Não foi possível conectar à API. Verifique se o backend está rodando.');
  }
  // Token ausente/expirado em rota protegida: avisa o App para voltar ao login.
  if (res.status === 401 && path !== '/auth/login') {
    sessao.limpar();
    window.dispatchEvent(new Event('oficinapro:sessao-expirada'));
  }
  if (res.status === 204) return null;
  const dados = await res.json().catch(() => null);
  if (!res.ok) {
    const detalhe = dados?.detalhes?.map((d) => d.mensagem).join('; ');
    throw new Error(detalhe || dados?.erro || `Erro ${res.status}`);
  }
  return dados;
}

export const api = {
  get: (p) => request('GET', p),
  post: (p, b) => request('POST', p, b),
  put: (p, b) => request('PUT', p, b),
  patch: (p, b) => request('PATCH', p, b),
  del: (p) => request('DELETE', p),
};

export const STATUS_LABEL = {
  ABERTA: 'Aberta',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};

// Espelha a RN5 do backend só para decidir quais botões mostrar.
export const PROXIMOS = {
  ABERTA: ['EM_ANDAMENTO', 'CANCELADA'],
  EM_ANDAMENTO: ['CONCLUIDA', 'CANCELADA'],
  CONCLUIDA: [],
  CANCELADA: [],
};

export const moeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const data = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') : '—');
export const formatarPlaca = (p) => (/^[A-Z]{3}\d{4}$/.test(p) ? `${p.slice(0, 3)}-${p.slice(3)}` : p);
