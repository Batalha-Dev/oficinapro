// Testes sempre rodam no banco oficina_test, nunca no banco de desenvolvimento.
// process.loadEnvFile não enxerga o process.env isolado do Jest, então lemos o .env manualmente.
const path = require('path');
const fs = require('fs');
const { parseEnv } = require('util');

const envFile = path.join(__dirname, '..', '.env');
const arquivo = fs.existsSync(envFile) ? parseEnv(fs.readFileSync(envFile, 'utf8')) : {};
for (const [chave, valor] of Object.entries(arquivo)) {
  if (process.env[chave] === undefined) process.env[chave] = valor;
}
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
