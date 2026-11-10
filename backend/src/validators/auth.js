const { z } = require('./common');

const loginSchema = z.object({
  email: z.string({ required_error: 'Informe o e-mail' }).trim().email('E-mail inválido'),
  senha: z.string({ required_error: 'Informe a senha' }).min(1, 'Informe a senha').max(200),
});

module.exports = { loginSchema };
