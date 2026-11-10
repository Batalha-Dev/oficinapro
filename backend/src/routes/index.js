const { Router } = require('express');
const autenticar = require('../middlewares/autenticar');
const authRoutes = require('./authRoutes');
const clienteRoutes = require('./clienteRoutes');
const veiculoRoutes = require('./veiculoRoutes');
const ordemRoutes = require('./ordemRoutes');
const resumo = require('../services/resumoService');

const router = Router();

router.use('/auth', authRoutes); // login é público

// Daqui para baixo, tudo exige login.
router.use(autenticar);
router.use('/clientes', clienteRoutes);
router.use('/veiculos', veiculoRoutes);
router.use('/ordens', ordemRoutes);
router.get('/resumo', async (req, res) => res.json(await resumo.doMes()));

module.exports = router;
