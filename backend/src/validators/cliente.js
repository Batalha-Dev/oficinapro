const { z, textoOpcional } = require('./common');

const clienteSchema = z.object({
  nome: z.string({ required_error: 'Nome é obrigatório' }).trim().min(2, 'Nome muito curto').max(120),
  telefone: z.string({ required_error: 'Telefone é obrigatório' }).trim().min(8, 'Telefone inválido').max(20),
  email: textoOpcional.pipe(z.string().email('E-mail inválido').optional()),
  cpf: textoOpcional
    .transform((v) => (v === undefined ? undefined : v.replace(/\D/g, '')))
    .pipe(z.string().length(11, 'CPF deve ter 11 dígitos').optional()),
});

module.exports = { clienteSchema };
