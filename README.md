# desafio-g4f

Aplicação full-stack composta por uma API backend em NestJS e um frontend em Next.js, organizadas como um monorepo pnpm. O enunciado completo do desafio está em [desafio.md](desafio.md).

## Stack

- **Backend**: NestJS 11, TypeScript, TypeORM + PostgreSQL, validação com Zod (`nestjs-zod`), documentação via Swagger.
- **Frontend**: Next.js 16 (App Router), React 19, CSS Modules, Axios, Vitest + Testing Library.
- **Banco de dados**: PostgreSQL 16.
- **Gerenciador de pacotes**: pnpm (workspaces).

## Estrutura do projeto

```
apps/
  backend/
    src/
      config/            # validação de env vars e configuração do Swagger
      infra/persistence/ # DataSource do TypeORM, migrations e seeds
      noticia/           # módulo de feature: controller, service, entity, repository, schemas
    test/                # testes e2e
  frontend/
    src/
      app/               # rotas (App Router), com estilos e testes colocalizados
      hooks/              # hooks reutilizáveis
      services/           # chamadas HTTP
      utils/              # funções puras utilitárias
```

**Por que essa estrutura?**

- **Monorepo com pnpm workspaces (`apps/*`)**: cada aplicação é uma unidade implantável independente, com seus próprios scripts, dependências e ciclo de build, enquanto o tooling comum (lint, format, test) é orquestrado a partir da raiz. Isso permite adicionar novos serviços (por exemplo, um worker ou um painel administrativo) ou pacotes compartilhados (`packages/*`) sem reestruturar o que já existe.
- **Backend em camadas**: `config/` isola configuração e validação de ambiente, `infra/persistence/` isola tudo relacionado a acesso a dados (DataSource, migrations versionadas, seeds), e cada feature (como `noticia/`) é um módulo autocontido do NestJS com sua própria entidade, repositório, serviço e schemas de validação. Essa separação entre infraestrutura e domínio facilita adicionar novas features ou trocar peças de infraestrutura (ex.: outro banco, outro ORM) sem alterar regra de negócio.
- **Frontend por rotas com colocalização**: cada rota do App Router mantém seus estilos e testes próximos ao componente, enquanto lógica reutilizável (chamadas de API em `services/`, hooks em `hooks/`, funções puras em `utils/`) fica isolada e compartilhável entre rotas. Esse padrão escala bem à medida que novas telas são adicionadas.
- **Dockerfiles multi-stage com build context na raiz**: como as dependências são resolvidas pelo workspace pnpm, o build de cada imagem parte da raiz do repositório, mas cada aplicação gera sua própria imagem enxuta (estágios de dependências, build e runtime separados), permitindo que backend e frontend sejam implantados e escalados de forma independente.

## Pré-requisitos

- Node.js 22+
- pnpm 10+ (`corepack enable` já resolve a versão fixada em `package.json`)
- Docker e Docker Compose (necessários também para os testes e2e do backend, que usam Testcontainers)

## Setup e execução local (sem Docker)

1. Instale as dependências na raiz do monorepo:

```bash
pnpm install
```

2. Configure as variáveis de ambiente do backend:

```bash
cp apps/backend/.env.example apps/backend/.env
```

3. Suba apenas o banco de dados com o compose específico do backend:

```bash
docker compose -f apps/backend/docker-compose.yml up -d
```

4. Rode as migrations:

```bash
pnpm --filter backend run migration:run
```

5. (Opcional) Popule o banco com dados de exemplo:

```bash
pnpm --filter backend run seed:noticia
```

6. (Opcional) Configure a URL da API consumida pelo frontend. Por padrão ele já aponta para `http://localhost:9000/api`; para customizar, copie o exemplo e ajuste `NEXT_PUBLIC_API_URL`:

```bash
cp apps/frontend/.env.example apps/frontend/.env
```

7. Suba backend e frontend juntos:

```bash
pnpm dev
```

Ou individualmente:

```bash
pnpm --filter backend start:dev
pnpm --filter frontend dev
```

**URLs disponíveis:**

- API: http://localhost:9000/api
- Documentação Swagger: http://localhost:9000/docs
- Frontend: http://localhost:3000

## Listagem de notícias (paginação, filtro e cache)

`GET /api/noticias` aceita os parâmetros de query:

- `pagina`: página desejada (padrão `1`).
- `limite`: quantidade de itens por página, de 1 a 100 (padrão `10`).
- `busca`: filtra notícias cujo `titulo` ou `descricao` contenham o termo informado.

```bash
curl "http://localhost:9000/api/noticias?pagina=1&limite=10&busca=eleições"
```

Resposta:

```json
{
  "itens": [{ "id": "...", "titulo": "...", "descricao": "...", "criadoEm": "...", "atualizadoEm": "..." }],
  "total": 42,
  "pagina": 1,
  "limite": 10,
  "totalPaginas": 5
}
```

A listagem mantém um cache em memória por 30 segundos, chaveado pela combinação `pagina`/`limite`/`busca`. O cache é invalidado automaticamente sempre que uma notícia é criada, atualizada ou removida, evitando dados desatualizados.

### Página de notícias no frontend

A rota `/noticias` consome o CRUD acima: formulário de criação/edição, listagem paginada com busca e ações de editar/remover por item. A URL da API é configurável via `NEXT_PUBLIC_API_URL` (ver passo 6 da seção anterior); sem essa variável, o frontend usa `http://localhost:9000/api` como padrão. O backend habilita CORS (`app.enableCors()` em `main.ts`) para aceitar essas requisições vindas de outra origem (`http://localhost:3000`).

## Setup e execução via Docker

Com o arquivo `apps/backend/.env` já configurado (passo 2 acima), suba toda a stack (banco, backend e frontend) a partir da raiz do repositório. O `--env-file` é necessário para que o Compose resolva as variáveis (`DB_USER`, `DB_PASSWORD`, etc.) usadas no `docker-compose.yml` raiz:

```bash
docker compose --env-file apps/backend/.env up --build
```

Isso inicia:

- `db`: PostgreSQL 16, com healthcheck para garantir que o backend só suba depois do banco estar pronto.
- `backend`: API NestJS, acessível em http://localhost:9000/api e com Swagger em http://localhost:9000/docs. As migrations rodam automaticamente ao iniciar (comportamento padrão em `NODE_ENV=dev`).
- `frontend`: aplicação Next.js, acessível em http://localhost:3000. O `docker-compose.yml` já passa `NEXT_PUBLIC_API_URL=http://localhost:9000/api` como build arg do serviço, apontando para o backend do próprio compose (variáveis `NEXT_PUBLIC_*` do Next.js são embutidas no bundle em tempo de build, por isso vão como `args` do build e não como `environment` de runtime).

Para parar os containers:

```bash
docker compose --env-file apps/backend/.env down
```

Para parar e remover também o volume do banco de dados:

```bash
docker compose --env-file apps/backend/.env down -v
```

## Testes

**Backend:**

```bash
pnpm --filter backend test        # testes unitários
pnpm --filter backend test:cov    # testes unitários com cobertura
pnpm --filter backend test:e2e    # testes e2e (requer Docker em execução, usa Testcontainers)
```

**Frontend:**

```bash
pnpm --filter frontend test        # testes unitários (Vitest)
pnpm --filter frontend test:watch  # modo watch
```

**Atalho na raiz** (roda os testes unitários de ambos os apps):

```bash
pnpm test
```

`apps/backend/test/noticia.e2e-spec.ts` e `apps/frontend/src/app/busca-cep/page.test.tsx` seguem estrutura BDD: cenários nomeados no formato "dado X, quando Y, então Z", com o corpo do teste organizado em blocos Given/When/Then (ou Dado/Quando/Então).

## Lint e formatação

```bash
pnpm lint          # corrige problemas de lint em backend e frontend
pnpm lint:check     # apenas verifica
pnpm format         # formata o código
pnpm format:check   # apenas verifica formatação
```

**Por que esses padrões?** ESLint e Prettier são integrados via `eslint-plugin-prettier`, de forma que um único comando (`lint`) cobre tanto regras de qualidade de código quanto formatação, evitando divergência entre o que o linter aceita e o que o formatter reescreve. `singleQuote: true` e `trailingComma: "all"` (`.prettierrc` de cada app) seguem o padrão mais comum no ecossistema TypeScript/Next.js e minimizam diffs em revisões: manter vírgula final em listas multi-linha evita que adicionar um item mude a linha anterior no diff.
