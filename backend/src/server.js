const path = require('path');
const fs = require('fs');

const envFile = path.join(__dirname, '..', '.env');
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

const app = require('./app');

const PORT = Number(process.env.PORT) || 3333;

app.listen(PORT, () => {
  console.log(`API OficinaPro rodando em http://localhost:${PORT}/api`);
});
