const { Router } = require('express');
const c = require('../controllers/ordemController');

const router = Router();

router.get('/', c.listar);
router.post('/', c.criar);
router.get('/:id', c.buscar);
router.put('/:id', c.atualizar);
router.delete('/:id', c.remover);
router.patch('/:id/status', c.alterarStatus);
router.post('/:id/itens', c.adicionarItem);
router.delete('/:id/itens/:itemId', c.removerItem);

module.exports = router;
