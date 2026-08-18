import axios from 'axios';

export interface Endereco {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

export class ErroBuscaCep extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroBuscaCep';
  }
}

interface RespostaViaCep {
  erro?: boolean;
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

export async function buscarEnderecoPorCep(cep: string): Promise<Endereco> {
  try {
    const resposta = await axios.get<RespostaViaCep>(
      `https://viacep.com.br/ws/${cep}/json/`,
    );

    if (resposta.data.erro) {
      throw new ErroBuscaCep('CEP não encontrado.');
    }

    const {
      cep: cepRetornado,
      logradouro,
      bairro,
      localidade,
      uf,
    } = resposta.data;

    return { cep: cepRetornado, logradouro, bairro, localidade, uf };
  } catch (erro) {
    if (erro instanceof ErroBuscaCep) {
      throw erro;
    }
    throw new ErroBuscaCep('Não foi possível buscar o endereço.');
  }
}
