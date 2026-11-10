const { Router } = require('express');
const c = require('../controllers/veiculoController');

const router = Router();

router.get('/', c.listar);
router.post('/', c.criar);
router.get('/:id', c.buscar);
router.put('/:id', c.atualizar);
router.delete('/:id', c.remover);

module.exports = router;
