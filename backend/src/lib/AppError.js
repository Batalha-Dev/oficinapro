// Erro de domínio com status HTTP explícito (404, 409, 422...).
class AppError extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.name = 'AppError';
    this.status = status;
  }
}

module.exports = AppError;
