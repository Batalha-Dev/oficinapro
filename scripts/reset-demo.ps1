# Plano B da apresentação (Windows/PowerShell): recria o banco do zero com os dados de demonstração.
# Uso: na raiz do projeto, rode  powershell -ExecutionPolicy Bypass -File scripts\reset-demo.ps1
$ErrorActionPreference = 'Stop'
Write-Host '1/3 Derrubando o banco e apagando o volume...'
docker compose down -v
Write-Host '2/3 Subindo PostgreSQL 16...'
docker compose up -d --wait
Write-Host '3/3 Aplicando migrações e seed...'
npm run setup --prefix backend
Write-Host 'Pronto. Rode: npm run dev'
