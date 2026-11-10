import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { sessao } from './api/client.js';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Painel from './pages/Painel.jsx';
import Clientes from './pages/Clientes.jsx';
import Veiculos from './pages/Veiculos.jsx';
import VeiculoHistorico from './pages/VeiculoHistorico.jsx';
import OrdemDetalhe from './pages/OrdemDetalhe.jsx';

export default function App() {
  const [usuario, setUsuario] = useState(() => sessao.ler()?.usuario ?? null);

  // A API dispara este evento quando recebe 401 (token vencido ou inválido).
  useEffect(() => {
    const sair = () => setUsuario(null);
    window.addEventListener('oficinapro:sessao-expirada', sair);
    return () => window.removeEventListener('oficinapro:sessao-expirada', sair);
  }, []);

  if (!usuario) return <Login onEntrar={(d) => setUsuario(d.usuario)} />;

  const sair = () => {
    sessao.limpar();
    setUsuario(null);
  };

  return (
    <Routes>
      <Route element={<Layout usuario={usuario} onSair={sair} />}>
        <Route path="/" element={<Painel />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/veiculos" element={<Veiculos />} />
        <Route path="/veiculos/:id" element={<VeiculoHistorico />} />
        <Route path="/ordens/:id" element={<OrdemDetalhe />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
