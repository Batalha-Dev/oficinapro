#!/usr/bin/env bash
# Plano B da apresentação (Linux/macOS/Git Bash): recria o banco do zero com os dados de demonstração.
set -e
echo "1/3 Derrubando o banco e apagando o volume..."
docker compose down -v
echo "2/3 Subindo PostgreSQL 16..."
docker compose up -d --wait
echo "3/3 Aplicando migrações e seed..."
npm run setup --prefix backend
echo "Pronto. Rode: npm run dev"
