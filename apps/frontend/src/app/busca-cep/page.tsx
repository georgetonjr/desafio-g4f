'use client';

import { useState } from 'react';
import estilos from './page.module.css';
import { useBuscaCep } from '../../hooks/useBuscaCep';
import { apenasDigitos, cepEhValido, formatarCep } from '../../utils/cep';

export default function PaginaBuscaCep() {
  const [cepDigitado, setCepDigitado] = useState('');
  const { endereco, carregando, erro, buscar, limpar } = useBuscaCep();

  const cepValido = cepEhValido(cepDigitado);

  function aoDigitarCep(evento: React.ChangeEvent<HTMLInputElement>) {
    setCepDigitado(formatarCep(evento.target.value));
    limpar();
  }

  async function aoSubmeter(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!cepValido || carregando) {
      return;
    }
    await buscar(apenasDigitos(cepDigitado));
  }

  return (
    <main className={estilos.pagina}>
      <div className={estilos.cartao}>
        <h1 className={estilos.titulo}>Busca de CEP</h1>
        <p className={estilos.subtitulo}>
          Informe um CEP para consultar o endereço correspondente.
        </p>

        <form className={estilos.formulario} onSubmit={aoSubmeter}>
          <label className={estilos.rotulo} htmlFor="campo-cep">
            CEP
          </label>
          <div className={estilos.linhaFormulario}>
            <input
              id="campo-cep"
              className={estilos.campo}
              type="text"
              inputMode="numeric"
              placeholder="00000-000"
              value={cepDigitado}
              onChange={aoDigitarCep}
              maxLength={9}
            />
            <button
              className={estilos.botao}
              type="submit"
              disabled={!cepValido || carregando}
            >
              {carregando ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </form>

        {carregando && (
          <div className={estilos.carregando} role="status">
            <span className={estilos.spinner} />
            Consultando endereço...
          </div>
        )}

        {erro && (
          <div className={estilos.mensagemErro} role="alert">
            {erro}
          </div>
        )}

        {endereco && (
          <dl className={estilos.resultado}>
            <div className={estilos.linhaResultado}>
              <dt>CEP</dt>
              <dd>{endereco.cep}</dd>
            </div>
            <div className={estilos.linhaResultado}>
              <dt>Logradouro</dt>
              <dd>{endereco.logradouro}</dd>
            </div>
            <div className={estilos.linhaResultado}>
              <dt>Bairro</dt>
              <dd>{endereco.bairro}</dd>
            </div>
            <div className={estilos.linhaResultado}>
              <dt>Cidade</dt>
              <dd>
                {endereco.localidade} - {endereco.uf}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </main>
  );
}
