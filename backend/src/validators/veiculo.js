const { z, PLACA_REGEX, normalizarPlaca, idParam } = require('./common');

const anoMax = () => new Date().getFullYear() + 1;

const veiculoSchema = z.object({
  placa: z
    .string({ required_error: 'Placa é obrigatória' })
    .transform(normalizarPlaca)
    .refine((p) => PLACA_REGEX.test(p), 'Placa inválida (use ABC1234 ou ABC1D23)'),
  marca: z.string({ required_error: 'Marca é obrigatória' }).trim().min(2, 'Marca muito curta').max(40),
  modelo: z.string({ required_error: 'Modelo é obrigatório' }).trim().min(1, 'Modelo é obrigatório').max(60),
  ano: z.coerce
    .number({ invalid_type_error: 'Ano inválido' })
    .int('Ano inválido')
    .min(1950, 'Ano mínimo é 1950')
    .refine((a) => a <= anoMax(), `Ano máximo é ${anoMax()}`),
  clienteId: idParam,
});

module.exports = { veiculoSchema };
