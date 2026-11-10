import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Painel from './pages/Painel.jsx';
import Clientes from './pages/Clientes.jsx';
import Veiculos from './pages/Veiculos.jsx';
import OrdemDetalhe from './pages/OrdemDetalhe.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Painel />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/veiculos" element={<Veiculos />} />
        <Route path="/ordens/:id" element={<OrdemDetalhe />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
