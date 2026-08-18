'use client';

import { useState } from 'react';
import estilos from './page.module.css';
import { useNoticias } from '../../hooks/useNoticias';
import { useNoticiaMutation } from '../../hooks/useNoticiaMutation';
import type { Noticia } from '../../services/servicoNoticia';

export default function PaginaNoticias() {
  const {
    itens,
    total,
    pagina,
    totalPaginas,
    carregando,
    erro,
    irParaPagina,
    definirBusca,
    recarregar,
  } = useNoticias();
  const {
    salvando,
    removendo,
    erro: erroMutacao,
    criar,
    atualizar,
    remover,
  } = useNoticiaMutation();

  const [tituloDigitado, setTituloDigitado] = useState('');
  const [descricaoDigitada, setDescricaoDigitada] = useState('');
  const [idEmEdicao, setIdEmEdicao] = useState<string | null>(null);
  const [termoBusca, setTermoBusca] = useState('');

  const formularioValido =
    tituloDigitado.trim().length > 0 && descricaoDigitada.trim().length > 0;

  function limparFormulario() {
    setTituloDigitado('');
    setDescricaoDigitada('');
    setIdEmEdicao(null);
  }

  function editarNoticia(noticia: Noticia) {
    setTituloDigitado(noticia.titulo);
    setDescricaoDigitada(noticia.descricao);
    setIdEmEdicao(noticia.id);
  }

  async function aoSubmeterFormulario(
    evento: React.FormEvent<HTMLFormElement>,
  ) {
    evento.preventDefault();
    if (!formularioValido || salvando) {
      return;
    }

    const dados = {
      titulo: tituloDigitado.trim(),
      descricao: descricaoDigitada.trim(),
    };

    const resultado = idEmEdicao
      ? await atualizar(idEmEdicao, dados)
      : await criar(dados);

    if (resultado) {
      limparFormulario();
      recarregar();
    }
  }

  async function removerItem(id: string) {
    const sucesso = await remover(id);
    if (sucesso) {
      recarregar();
    }
  }

  function aoSubmeterBusca(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    definirBusca(termoBusca.trim());
  }

  return (
    <main className={estilos.pagina}>
      <div className={estilos.cartao}>
        <h1 className={estilos.titulo}>Notícias</h1>
        <p className={estilos.subtitulo}>
          Crie, edite, remova e pesquise notícias cadastradas.
        </p>

        <form className={estilos.formulario} onSubmit={aoSubmeterFormulario}>
          <label className={estilos.rotulo} htmlFor="campo-titulo">
            Título
          </label>
          <input
            id="campo-titulo"
            className={estilos.campo}
            type="text"
            value={tituloDigitado}
            onChange={(evento) => setTituloDigitado(evento.target.value)}
          />

          <label className={estilos.rotulo} htmlFor="campo-descricao">
            Descrição
          </label>
          <textarea
            id="campo-descricao"
            className={estilos.area}
            value={descricaoDigitada}
            onChange={(evento) => setDescricaoDigitada(evento.target.value)}
          />

          <div className={estilos.acoesFormulario}>
            <button
              className={estilos.botao}
              type="submit"
              disabled={!formularioValido || salvando}
            >
              {salvando ? 'Salvando...' : idEmEdicao ? 'Salvar' : 'Criar'}
            </button>
            {idEmEdicao && (
              <button
                className={estilos.botaoSecundario}
                type="button"
                onClick={limparFormulario}
              >
                Cancelar edição
              </button>
            )}
          </div>
        </form>

        {erroMutacao && (
          <div className={estilos.mensagemErro} role="alert">
            {erroMutacao}
          </div>
        )}

        <form className={estilos.formularioBusca} onSubmit={aoSubmeterBusca}>
          <label className={estilos.rotulo} htmlFor="campo-busca">
            Buscar
          </label>
          <div className={estilos.linhaFormulario}>
            <input
              id="campo-busca"
              className={estilos.campo}
              type="text"
              placeholder="Filtrar por título ou descrição"
              value={termoBusca}
              onChange={(evento) => setTermoBusca(evento.target.value)}
            />
            <button className={estilos.botao} type="submit">
              Buscar
            </button>
          </div>
        </form>

        {carregando && (
          <div className={estilos.carregando} role="status">
            <span className={estilos.spinner} />
            Carregando notícias...
          </div>
        )}

        {erro && (
          <div className={estilos.mensagemErro} role="alert">
            {erro}
          </div>
        )}

        {!carregando && !erro && itens.length === 0 && (
          <p className={estilos.vazio}>Nenhuma notícia encontrada.</p>
        )}

        {itens.length > 0 && (
          <ul className={estilos.lista}>
            {itens.map((noticia) => (
              <li key={noticia.id} className={estilos.item}>
                <div className={estilos.itemConteudo}>
                  <h2 className={estilos.itemTitulo}>{noticia.titulo}</h2>
                  <p className={estilos.itemDescricao}>{noticia.descricao}</p>
                </div>
                <div className={estilos.itemAcoes}>
                  <button
                    className={estilos.botaoSecundario}
                    type="button"
                    onClick={() => editarNoticia(noticia)}
                  >
                    Editar
                  </button>
                  <button
                    className={estilos.botaoPerigo}
                    type="button"
                    disabled={removendo}
                    onClick={() => removerItem(noticia.id)}
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {totalPaginas > 1 && (
          <div className={estilos.paginacao}>
            <button
              className={estilos.botaoSecundario}
              type="button"
              disabled={pagina <= 1}
              onClick={() => irParaPagina(pagina - 1)}
            >
              Anterior
            </button>
            <span className={estilos.infoPaginacao}>
              Página {pagina} de {totalPaginas} ({total} notícias)
            </span>
            <button
              className={estilos.botaoSecundario}
              type="button"
              disabled={pagina >= totalPaginas}
              onClick={() => irParaPagina(pagina + 1)}
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
