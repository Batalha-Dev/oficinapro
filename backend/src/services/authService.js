const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const AppError = require('../lib/AppError');

const EXPIRA_EM = '8h'; // um turno de trabalho

function segredo() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET não configurado no .env');
  return s;
}

function gerarToken(usuario) {
  return jwt.sign({ sub: usuario.id, nome: usuario.nome }, segredo(), { expiresIn: EXPIRA_EM });
}

function verificarToken(token) {
  return jwt.verify(token, segredo());
}

async function login(email, senha) {
  const usuario = await prisma.usuario.findUnique({ where: { email: email.toLowerCase() } });
  // Mesma mensagem para e-mail inexistente e senha errada: não revela quais e-mails existem.
  const ok = usuario && (await bcrypt.compare(senha, usuario.senhaHash));
  if (!ok) throw new AppError(401, 'E-mail ou senha incorretos');
  return { token: gerarToken(usuario), usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } };
}

const hashSenha = (senha) => bcrypt.hash(senha, 10);

module.exports = { login, gerarToken, verificarToken, hashSenha };
