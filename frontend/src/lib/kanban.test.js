import { describe, expect, test } from 'vitest';
import { filtrarOrdens, podeSoltar } from './kanban.js';

const os = (id, placa, cliente, modelo, problema, status = 'ABERTA') => ({
  id,
  status,
  descricaoProblema: problema,
  veiculo: { placa, marca: 'Marca', modelo, cliente: { nome: cliente } },
});

const ordens = [
  os(1, 'ABC1234', 'João Silva', 'Gol', 'Freio fazendo barulho'),
  os(2, 'BRA2E19', 'Carla Mendes', 'Strada', 'Ar-condicionado'),
];

describe('filtrarOrdens', () => {
  test('termo vazio devolve todas', () => {
    expect(filtrarOrdens(ordens, '  ')).toHaveLength(2);
  });
  test('ignora acento e caixa no nome do cliente', () => {
    expect(filtrarOrdens(ordens, 'JOAO').map((o) => o.id)).toEqual([1]);
  });
  test('acha placa digitada com hífen', () => {
    expect(filtrarOrdens(ordens, 'abc-1234').map((o) => o.id)).toEqual([1]);
  });
  test('acha pelo problema e pelo número da OS', () => {
    expect(filtrarOrdens(ordens, 'condicionado').map((o) => o.id)).toEqual([2]);
    expect(filtrarOrdens(ordens, '#2').map((o) => o.id)).toEqual([2]);
  });
  test('sem resultado devolve lista vazia', () => {
    expect(filtrarOrdens(ordens, 'zzz')).toEqual([]);
  });
});

describe('podeSoltar (espelha a RN5)', () => {
  test.each([
    ['ABERTA', 'EM_ANDAMENTO', true],
    ['ABERTA', 'CONCLUIDA', false],
    ['EM_ANDAMENTO', 'CONCLUIDA', true],
    ['CONCLUIDA', 'ABERTA', false],
    ['ABERTA', 'ABERTA', false],
  ])('%s -> %s = %s', (de, para, esperado) => {
    expect(podeSoltar(de, para)).toBe(esperado);
  });
});
