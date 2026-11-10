// Único ponto de acesso à API: padroniza JSON, erros e mensagens do servidor.
async function request(method, path, body) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Não foi possível conectar à API. Verifique se o backend está rodando.');
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
