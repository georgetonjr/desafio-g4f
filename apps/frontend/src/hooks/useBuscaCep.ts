'use client';

import { useState } from 'react';
import {
  buscarEnderecoPorCep,
  ErroBuscaCep,
  type Endereco,
} from '../services/servicoCep';

interface ResultadoUseBuscaCep {
  endereco: Endereco | null;
  carregando: boolean;
  erro: string | null;
  buscar: (cep: string) => Promise<void>;
  limpar: () => void;
}

export function useBuscaCep(): ResultadoUseBuscaCep {
  const [endereco, setEndereco] = useState<Endereco | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function buscar(cep: string) {
    setCarregando(true);
    setErro(null);
    setEndereco(null);

    try {
      const resultado = await buscarEnderecoPorCep(cep);
      setEndereco(resultado);
    } catch (excecao) {
      const mensagem =
        excecao instanceof ErroBuscaCep
          ? excecao.message
          : 'Erro inesperado ao buscar o CEP.';
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  function limpar() {
    setEndereco(null);
    setErro(null);
  }

  return { endereco, carregando, erro, buscar, limpar };
}
