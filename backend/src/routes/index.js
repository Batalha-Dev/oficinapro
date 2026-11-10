const { Router } = require('express');
const clienteRoutes = require('./clienteRoutes');
const veiculoRoutes = require('./veiculoRoutes');
const ordemRoutes = require('./ordemRoutes');

const router = Router();

router.use('/clientes', clienteRoutes);
router.use('/veiculos', veiculoRoutes);
router.use('/ordens', ordemRoutes);

module.exports = router;
