# Delivery Project

Sistema de delivery modular com múltiplos papéis de usuário: cliente, dono de restaurante e entregador. O backend expõe uma API REST organizada por responsabilidade, com autenticação via JWT, autorização por papel e documentação Swagger.

---

## Tecnologias / Stack

| Camada | Tecnologia |
|--------|------------|
| Runtime | Node.js com ES Modules |
| Framework web | Express.js |
| Banco de dados | SQLite via Prisma ORM |
| Adapter SQLite | `@prisma/adapter-better-sqlite3` |
| Validação de dados | Zod |
| Autenticação | JWT (`jsonwebtoken`) + cookies |
| Segurança | Helmet, CORS, rate limiting, CSRF middleware |
| Documentação da API | Swagger (swagger-autogen / swagger-ui-express) |

---

## Estrutura de pastas

```
src/
├── config/          # Configurações gerais (ex.: upload, variáveis de ambiente)
├── controllers/     # Controle das requisições HTTP
│   ├── owner/       # Dono de restaurante
│   ├── customer/    # Cliente
│   └── delivery/    # Entregador
├── services/        # Regras de negócio e acesso ao banco
│   ├── owner/
│   ├── customer/
│   └── delivery/
├── routers/         # Definição das rotas
│   ├── owner/
│   ├── customer/
│   ├── delivery/
│   └── public.router.js
├── middlewares/     # Autenticação, autorização, rate limit, CSRF
├── validations/     # Schemas de validação com Zod
├── lib/             # Cliente Prisma e integrações externas
├── utils/           # Funções utilitárias (JWT, cookies, constantes)
└── generated/       # Cliente gerado pelo Prisma
```

A divisão por papéis dentro de `controllers`, `services` e `routers` mantém o código organizado e facilita a aplicação de regras de autorização específicas.

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) instalado
- npm (gerenciador de pacotes do Node.js)

---

## Instalação e execução

1. Clone o repositório e acesse a pasta do projeto.
2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente no arquivo `.env`.
4. Execute o projeto em modo de desenvolvimento:

   ```bash
   npm run dev
   ```

   Ou em produção:

   ```bash
   npm start
   ```

O servidor será iniciado na porta `3000` por padrão.

---

## Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia o servidor em modo de desenvolvimento |
| `npm start` | Inicia o servidor em modo de produção |
| `npm run swagger` | Gera a documentação Swagger |

---

## Autenticação e autorização

A API utiliza **JWT** para autenticação. O token pode ser enviado via:

- Cookie de acesso (`access_token`)
- Header `Authorization: Bearer <token>`

Os middlewares de autenticação (`authToken`) e autorização verificam o token e o papel do usuário antes de permitir o acesso às rotas protegidas.

### Papéis de usuário

- `owner` — dono de restaurante (gerencia cardápio, pedidos e informações do restaurante)
- `customer` — cliente (realiza pedidos e gerencia endereços)
- `delivery` — entregador (aceita e executa entregas)

---

## Documentação da API

A documentação interativa da API está disponível via Swagger UI após a geração. Gere a documentação com:

```bash
npm run swagger
```

Em seguida, acesse a rota configurada no projeto (normalmente `/api-docs` ou similar) para visualizar e testar os endpoints.

---

## Padrões do projeto

- **Separação de responsabilidades:** controllers recebem requisições, services executam regras de negócio e acessam o banco.
- **Validação:** entradas da API são validadas com Zod antes de chegar aos services.
- **Autorização por papel:** routers de `owner`, `customer` e `delivery` aplicam middlewares específicos para cada tipo de usuário.
- **Segurança:** uso de Helmet, CORS, rate limiting e CSRF nas rotas sensíveis.

---

## Licença

ISC
