const service = require('../services/authService');
const { loginSchema } = require('../validators/auth');

async function login(req, res) {
  const { email, senha } = loginSchema.parse(req.body);
  res.json(await service.login(email, senha));
}

async function eu(req, res) {
  res.json(req.usuario);
}

module.exports = { login, eu };
