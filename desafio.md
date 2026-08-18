Prova técnica Frontend

Prova técnica frontend

1. Versione o projeto React (TypeScript ou JavaScript) no github.com e crie a estrutura de branches baseadas no GitFlow.

2. Faça uma tela com formulário para busca de endereços por CEP na API http://viacep.com.br/ws/01001000/json/ usando axios e Loading States, Tratamento de Erros e UX.

3. Estilize a tela para busca de CEP com CSS próprio ("manual") e Design Responsivo.

4. Desenvolva um CRUD RESTful API para a entidade "Noticia". A entidade precisa ter apenas os atributos "titulo" e "descricao". Use o backend desenvolvido e faça a integração com seu frontend realizando a paginação conforme foi desenvolvido no backend, caso não consiga use o servidor JSON como o json-server para manter o backend.

5. Implemente um teste conforme a metodologia BDD para a da busca de endereços por CEP.

6. Crie um dockerfile para a aplicação e execute localmente. Dockerização Otimizada (Multi-stage)

7. Inclua no README instruções detalhadas sobre como configurar, executar, e testar a aplicação, tanto localmente quanto usando Docker.

8. Justifique a estrutura de pastas/arquivos criada e padrões de Código (Linter/Prettier).
 
 
Prova técnica Backend
 
Prova técnica backend

1. Versione o projeto API RESTful no github.com e crie a estrutura de branches baseadas no GitFlow.

2. Desenvolva uma API RESTful em Node ou PHP. Utilize o framework de preferência para desenvolver uma API RESTful para a entidade "Noticia".
A entidade deve ter os atributos "id", "titulo", "descricao" com ORM/ODM e Banco de Dados Real (Dockerizado).

3. Implemente endpoints para criar, listar, atualizar e deletar notícias - com Validação de Payload e Códigos HTTP Semânticos

4. Escreva testes automatizados conforme a metodologia BDD para ao menos um dos endpoints da API, focando em comportamentos como criação de Noticia, pelo menos 2 testes.

5. Crie um dockerfile para a aplicação e execute localmente com Docker Compose para orquestração da API e DB

6. Justifique a estrutura de pastas/arquivos criada e Preparação para Escalar.

7. Inclua no README instruções detalhadas sobre como configurar, executar, e testar a aplicação, tanto localmente quanto usando Docker.

8. Design de API Avançado (Filtros e Paginação): Refatore o endpoint de listagem de Notícias (GET /noticias) para aceitar parâmetros de consulta que permitam paginação (page, limit) e filtragem por título ou descrição. O retorno deve incluir metadados (total de itens, página atual).

9. Simulação de Tarefa Assíncrona e Caching (ou Fila): Implemente uma camada de caching (ex: usando um mock de Redis local ou memória cache simples) na listagem de notícias para melhorar a performance. OU (opção alternativa): Use um mock de fila (ex: in-memory queue) para simular o processamento assíncrono de uma notificação após a criação de uma Notícia.