'use client';

import { useEffect, useState } from 'react';
import {
  listarNoticias,
  ErroNoticia,
  type Noticia,
} from '../services/servicoNoticia';

interface ResultadoUseNoticias {
  itens: Noticia[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
  busca: string;
  carregando: boolean;
  erro: string | null;
  irParaPagina: (pagina: number) => void;
  definirBusca: (busca: string) => void;
  recarregar: () => void;
}

export function useNoticias(limitePorPagina = 10): ResultadoUseNoticias {
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState('');
  const [itens, setItens] = useState<Noticia[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setCarregando(true);
      setErro(null);

      try {
        const resultado = await listarNoticias({
          pagina,
          limite: limitePorPagina,
          busca: busca || undefined,
        });
        if (!ativo) {
          return;
        }
        setItens(resultado.itens);
        setTotal(resultado.total);
        setTotalPaginas(resultado.totalPaginas);
      } catch (excecao) {
        if (!ativo) {
          return;
        }
        const mensagem =
          excecao instanceof ErroNoticia
            ? excecao.message
            : 'Erro inesperado ao carregar as notícias.';
        setErro(mensagem);
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, [pagina, busca, limitePorPagina, versao]);

  function irParaPagina(novaPagina: number) {
    setPagina(novaPagina);
  }

  function definirBusca(novaBusca: string) {
    setBusca(novaBusca);
    setPagina(1);
  }

  function recarregar() {
    setVersao((versaoAtual) => versaoAtual + 1);
  }

  return {
    itens,
    total,
    pagina,
    limite: limitePorPagina,
    totalPaginas,
    busca,
    carregando,
    erro,
    irParaPagina,
    definirBusca,
    recarregar,
  };
}
