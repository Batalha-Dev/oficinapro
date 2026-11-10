const { verificarToken } = require('../services/authService');

// Exige "Authorization: Bearer <token>" válido; anexa o usuário em req.usuario.
function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ erro: 'Faça login para continuar' });
  }
  try {
    const { sub, nome } = verificarToken(token);
    req.usuario = { id: sub, nome };
    return next();
  } catch {
    return res.status(401).json({ erro: 'Sessão expirada. Faça login novamente' });
  }
}

module.exports = autenticar;
