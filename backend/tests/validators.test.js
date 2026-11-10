const { normalizarPlaca } = require('../src/validators/common');
const { veiculoSchema } = require('../src/validators/veiculo');
const { clienteSchema } = require('../src/validators/cliente');
const { itemSchema } = require('../src/validators/ordem');

const base = { marca: 'Fiat', modelo: 'Uno', ano: 2010, clienteId: 1 };

describe('validações', () => {
  test('normaliza placa com hífen e minúsculas', () => {
    expect(normalizarPlaca('abc-1d23')).toBe('ABC1D23');
  });

  test.each(['ABC1234', 'ABC1D23', 'abc-1234'])('aceita placa %s', (placa) => {
    expect(veiculoSchema.safeParse({ ...base, placa }).success).toBe(true);
  });

  test.each(['AB12345', 'ABCD123', '1234567', ''])('rejeita placa "%s"', (placa) => {
    expect(veiculoSchema.safeParse({ ...base, placa }).success).toBe(false);
  });

  test('rejeita ano 1949', () => {
    expect(veiculoSchema.safeParse({ ...base, placa: 'ABC1234', ano: 1949 }).success).toBe(false);
  });

  test('email vazio vira undefined e CPF perde a máscara', () => {
    const r = clienteSchema.parse({ nome: 'Ana', telefone: '49999990000', email: '', cpf: '123.456.789-09' });
    expect(r.email).toBeUndefined();
    expect(r.cpf).toBe('12345678909');
  });

  test('valor monetário em string é convertido para número', () => {
    expect(itemSchema.parse({ descricao: 'Óleo', valorUnitario: '10.50' }).valorUnitario).toBe(10.5);
  });
});
