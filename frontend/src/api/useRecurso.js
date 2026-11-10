import { useCallback, useEffect, useState } from 'react';
import { api } from './client.js';

// Carrega um recurso da API com estados de loading/erro e função de recarregar.
export function useRecurso(path) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setDados(await api.get(path));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [path]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return { dados, carregando, erro, recarregar };
}
