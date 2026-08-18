'use client';

import { useState } from 'react';
import {
  criarNoticia,
  atualizarNoticia,
  removerNoticia,
  ErroNoticia,
  type DadosNoticia,
  type Noticia,
} from '../services/servicoNoticia';

interface ResultadoUseNoticiaMutation {
  salvando: boolean;
  removendo: boolean;
  erro: string | null;
  criar: (dados: DadosNoticia) => Promise<Noticia | null>;
  atualizar: (id: string, dados: DadosNoticia) => Promise<Noticia | null>;
  remover: (id: string) => Promise<boolean>;
}

function mensagemDeErro(excecao: unknown, mensagemPadrao: string): string {
  return excecao instanceof ErroNoticia ? excecao.message : mensagemPadrao;
}

export function useNoticiaMutation(): ResultadoUseNoticiaMutation {
  const [salvando, setSalvando] = useState(false);
  const [removendo, setRemovendo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function criar(dados: DadosNoticia): Promise<Noticia | null> {
    setSalvando(true);
    setErro(null);
    try {
      return await criarNoticia(dados);
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, 'Erro inesperado ao criar a notícia.'));
      return null;
    } finally {
      setSalvando(false);
    }
  }

  async function atualizar(
    id: string,
    dados: DadosNoticia,
  ): Promise<Noticia | null> {
    setSalvando(true);
    setErro(null);
    try {
      return await atualizarNoticia(id, dados);
    } catch (excecao) {
      setErro(
        mensagemDeErro(excecao, 'Erro inesperado ao atualizar a notícia.'),
      );
      return null;
    } finally {
      setSalvando(false);
    }
  }

  async function remover(id: string): Promise<boolean> {
    setRemovendo(true);
    setErro(null);
    try {
      await removerNoticia(id);
      return true;
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, 'Erro inesperado ao remover a notícia.'));
      return false;
    } finally {
      setRemovendo(false);
    }
  }

  return { salvando, removendo, erro, criar, atualizar, remover };
}
