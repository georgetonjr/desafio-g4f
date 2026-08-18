import 'dotenv/config';
import dataSource from '../data-source';
import { Noticia } from '../../../noticia/noticia.entity';

const noticias: Array<Pick<Noticia, 'titulo' | 'descricao'>> = [
  {
    titulo: 'Nova versão do sistema é lançada',
    descricao:
      'A equipe de desenvolvimento lançou uma nova versão com melhorias de desempenho e correções de bugs.',
  },
  {
    titulo: 'Empresa anuncia expansão para novos mercados',
    descricao:
      'A companhia divulgou planos de expansão para outros três estados até o final do ano.',
  },
  {
    titulo: 'Evento de tecnologia reúne especialistas da área',
    descricao:
      'Profissionais de diversas empresas se reuniram para discutir tendências e inovações do setor.',
  },
  {
    titulo: 'Pesquisa aponta crescimento no uso de aplicativos móveis',
    descricao:
      'Levantamento recente mostra aumento significativo no tempo de uso de aplicativos móveis pelos usuários.',
  },
  {
    titulo: 'Startup recebe investimento para expandir operações',
    descricao:
      'A startup local recebeu aporte financeiro que será utilizado para contratação de novos talentos.',
  },
];

async function seed() {
  const connection = await dataSource.initialize();

  try {
    const repository = connection.getRepository(Noticia);
    await repository.insert(noticias);
  } finally {
    await connection.destroy();
  }
}

void seed();
