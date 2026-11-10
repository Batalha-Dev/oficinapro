const { Router } = require('express');
const c = require('../controllers/authController');
const autenticar = require('../middlewares/autenticar');

const router = Router();

router.post('/login', c.login);
router.get('/eu', autenticar, c.eu);

module.exports = router;
