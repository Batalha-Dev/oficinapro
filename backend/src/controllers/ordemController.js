const service = require('../services/ordemService');
const { ordemSchema, ordemUpdateSchema, statusSchema, itemSchema, STATUS } = require('../validators/ordem');
const { idParam, z } = require('../validators/common');

const filtroStatus = z.enum(STATUS, { errorMap: () => ({ message: 'Status inválido' }) }).optional();

async function listar(req, res) {
  const veiculoId = req.query.veiculoId ? idParam.parse(req.query.veiculoId) : undefined;
  res.json(await service.listar({ status: filtroStatus.parse(req.query.status || undefined), veiculoId }));
}

async function buscar(req, res) {
  res.json(await service.buscar(idParam.parse(req.params.id)));
}

async function criar(req, res) {
  res.status(201).json(await service.criar(ordemSchema.parse(req.body)));
}

async function atualizar(req, res) {
  res.json(await service.atualizar(idParam.parse(req.params.id), ordemUpdateSchema.parse(req.body)));
}

async function remover(req, res) {
  await service.remover(idParam.parse(req.params.id));
  res.status(204).end();
}

async function alterarStatus(req, res) {
  const { status } = statusSchema.parse(req.body);
  res.json(await service.alterarStatus(idParam.parse(req.params.id), status));
}

async function adicionarItem(req, res) {
  res.status(201).json(await service.adicionarItem(idParam.parse(req.params.id), itemSchema.parse(req.body)));
}

async function removerItem(req, res) {
  await service.removerItem(idParam.parse(req.params.id), idParam.parse(req.params.itemId));
  res.status(204).end();
}

module.exports = { listar, buscar, criar, atualizar, remover, alterarStatus, adicionarItem, removerItem };
