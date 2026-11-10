const { z, idParam } = require('./common');

const STATUS = ['ABERTA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA'];

const itemSchema = z.object({
  descricao: z.string({ required_error: 'Descrição é obrigatória' }).trim().min(2, 'Descrição muito curta').max(120),
  quantidade: z.coerce.number().int().min(1, 'Quantidade mínima é 1').max(9999, 'Quantidade máxima é 9999').default(1),
  valorUnitario: z.coerce
    .number({ invalid_type_error: 'Valor inválido' })
    .min(0, 'Valor não pode ser negativo')
    .max(999999.99, 'Valor máximo é 999.999,99')
    .transform((v) => Math.round(v * 100) / 100),
});

const ordemSchema = z.object({
  veiculoId: idParam,
  descricaoProblema: z
    .string({ required_error: 'Descreva o problema' })
    .trim()
    .min(3, 'Descrição muito curta')
    .max(500),
  itens: z.array(itemSchema).optional().default([]),
});

const ordemUpdateSchema = z.object({
  descricaoProblema: z
    .string({ required_error: 'Descreva o problema' })
    .trim()
    .min(3, 'Descrição muito curta')
    .max(500),
});

const statusSchema = z.object({
  status: z.enum(STATUS, { errorMap: () => ({ message: 'Status inválido' }) }),
});

module.exports = { STATUS, itemSchema, ordemSchema, ordemUpdateSchema, statusSchema };
