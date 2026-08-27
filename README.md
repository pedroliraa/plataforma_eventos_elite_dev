# Elite Events 🎟️

Plataforma de eventos e ingressos desenvolvida como solução para o desafio técnico Elite Dev.

A aplicação permite que organizadores criem e gerenciem eventos, clientes reservem e paguem ingressos de forma simulada, recebam ingressos com QR Code e compartilhem seus ingressos por link. A portaria possui uma área exclusiva para validação dos ingressos, incluindo leitura do QR Code pela câmera.

---

## Sobre o projeto

O **Elite Events** foi desenvolvido para atender ao fluxo completo de uma plataforma de eventos:

```text
API externa
    ↓
Catálogo de eventos
    ↓
Organizador cria evento
    ↓
Evento publicado
    ↓
Cliente reserva ingresso
    ↓
Pagamento simulado
    ↓
Ingresso + QR Code
    ↓
Compartilhamento
    ↓
Portaria valida ingresso
```

O projeto prioriza um fluxo simples e completo de ponta a ponta, com separação de responsabilidades entre Front-End e Back-End.

---

## Funcionalidades

### Cliente

* Cadastro de usuário
* Login e autenticação
* Navegação pelos eventos publicados
* Visualização dos detalhes de um evento
* Reserva de ingressos
* Pagamento simulado
* Tratamento de pagamento aprovado e recusado
* Visualização dos ingressos adquiridos
* Geração de QR Code
* Compartilhamento do ingresso através de link
* Bloqueio de acesso a áreas restritas

### Organizador

* Login com perfil de organizador
* Criação de eventos
* Seleção de conteúdo do catálogo externo
* Definição de data, local, capacidade e preço
* Visualização dos próprios eventos
* Gerenciamento dos eventos
* Cancelamento de eventos
* Controle de acesso para impedir gerenciamento de eventos de outros organizadores

### Portaria

* Área exclusiva para usuários de portaria
* Seleção do evento
* Leitura de QR Code pela câmera
* Digitação manual do código como alternativa
* Validação do ingresso
* Identificação de ingresso válido
* Identificação de ingresso inválido
* Identificação de ingresso já utilizado
* Identificação de ingresso pertencente a outro evento
* Bloqueio de validação duplicada

---

## Tecnologias

### Front-End

* React
* Next.js
* TypeScript
* CSS
* html5-qrcode

### Back-End

* Node.js
* Express
* TypeScript
* Prisma ORM
* PostgreSQL
* JWT
* bcrypt

### Infraestrutura

* Docker / Docker Compose
* Vercel
* Render

### Integrações

* Ticketmaster Discovery API
* QR Code

---

## Estrutura do projeto

```text
plataforma_eventos_elite_dev/
│
├── server/
│   ├── prisma/
│   └── src/
│       ├── middlewares/
│       ├── modules/
│       │   ├── auth/
│       │   ├── events/
│       │   ├── reservations/
│       │   └── tickets/
│       └── app.ts
│
├── web/
│   ├── app/
│   │   ├── events/
│   │   ├── gate/
│   │   ├── ingresso/
│   │   ├── meus-ingressos/
│   │   ├── organizer/
│   │   ├── login/
│   │   └── register/
│   ├── components/
│   └── lib/
│
├── docker-compose.yml
└── README.md
```

---

# Como executar localmente

## Pré-requisitos

Antes de iniciar, tenha instalado:

* Node.js
* npm
* Docker
* Git

Também é necessário possuir uma chave da API do Ticketmaster.

---

## 1. Clonar o projeto

```bash
git clone <URL_DO_REPOSITORIO>
cd plataforma_eventos_elite_dev
```

---

# Banco de dados

O projeto utiliza PostgreSQL.

O banco pode ser iniciado através do Docker Compose:

```bash
docker compose up -d
```

Verifique se o container está rodando:

```bash
docker ps
```

---

# 🔧 Configuração do Back-End

Entre na pasta:

```bash
cd server
```

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/elite_events"
JWT_SECRET="sua-chave-secreta"
TICKETMASTER_API_KEY="sua-chave-do-ticketmaster"
PORT=3001
```

> Os valores acima são exemplos. Não versionar o arquivo `.env`.

---

## Prisma

Execute as migrations:

```bash
npx prisma migrate dev
```

Caso o projeto possua seed configurado:

```bash
npx prisma db seed
```

Para visualizar o banco através do Prisma Studio:

```bash
npx prisma studio
```

---

## Executar o Back-End

```bash
npm run dev
```

O servidor estará disponível em:

```text
http://localhost:3001
```

Para verificar se a API está funcionando:

```text
GET /
```

Resposta esperada:

```json
{
  "message": "Elite Events and Tickets API is running"
}
```

---

# Configuração do Front-End

Em outro terminal:

```bash
cd web
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo:

```text
.env.local
```

Com:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Essa variável permite que a URL da API seja alterada sem modificar o código da aplicação.

Execute:

```bash
npm run dev
```

O Front-End estará disponível em:

```text
http://localhost:3000
```

---

# Autenticação

A aplicação possui três papéis:

| Papel       | Responsabilidades                            |
| ----------- | -------------------------------------------- |
| `CUSTOMER`  | Navegar, reservar, pagar e acessar ingressos |
| `ORGANIZER` | Criar e gerenciar eventos                    |
| `GATE`      | Validar ingressos na entrada                 |

O acesso às rotas é protegido tanto no Front-End quanto no Back-End.

---

# Fluxo de ingressos

Após uma reserva e pagamento aprovado, o sistema gera um ingresso associado à reserva.

Cada ingresso possui um código utilizado para gerar o QR Code.

Na portaria, o QR Code pode ser:

1. Lido pela câmera;
2. Informado manualmente.

Após a leitura, o Back-End valida:

* autenticidade do código;
* existência do ingresso;
* evento selecionado;
* status do ingresso;
* utilização anterior.

Um ingresso validado não pode ser utilizado novamente.

---

# Pagamento

O pagamento é **simulado**, conforme permitido pelo desafio.

O fluxo contempla:

* pagamento aprovado;
* pagamento recusado;
* confirmação da reserva após pagamento aprovado;
* tratamento de erro em caso de recusa.

Não existe nenhuma transação financeira real.

---

# API externa

O projeto utiliza a **Ticketmaster Discovery API** como fonte externa de dados para o catálogo de eventos.

Os dados retornados pela API são utilizados como base para que o organizador possa selecionar o conteúdo do evento que será publicado na plataforma.

A chave da API deve ser configurada através da variável:

```env
TICKETMASTER_API_KEY=...
```

---

# Compartilhamento de ingressos

Os ingressos possuem um token de compartilhamento que permite gerar um link público para visualização do ingresso.

O link compartilhado não exige que o destinatário esteja autenticado para visualizar o ingresso disponibilizado.

A validação efetiva do ingresso continua sendo responsabilidade da API e da área de portaria.

---

# Dados de teste

Para facilitar a avaliação, o projeto deve possuir dados previamente cadastrados para percorrer os principais fluxos.

Perfis esperados:

* 1 usuário Organizador
* 2 usuários Cliente
* 1 usuário Portaria
* Pelo menos 1 evento publicado
* Ingressos disponíveis para reserva

### Usuários

| Perfil      | E-mail                  | Senha      |
| ----------- | ----------------------- | ---------- |
| Organizador | `organizer@example.com` | `senha123` |
| Cliente 1   | `customer1@example.com` | `senha123` |
| Cliente 2   | `customer2@example.com` | `senha123` |
| Portaria    | `gate@example.com`      | `senha123` |

> Os usuários acima devem corresponder aos dados efetivamente semeados no banco. Caso as credenciais do seed sejam diferentes, utilize as credenciais definidas no arquivo de seed.

---

# Decisões técnicas

## Reserva de ingressos

A aplicação utiliza uma estratégia de persistência no banco para evitar que o mesmo lugar/ingresso disponível seja vendido duas vezes.

A validação é realizada no Back-End, evitando depender apenas de controles no Front-End.

## Autenticação

JWT foi utilizado para autenticação porque permite manter o Back-End stateless e transportar as informações necessárias para autorização das rotas.

## Controle de permissões

Além da autenticação, as rotas verificam o papel do usuário.

Isso evita, por exemplo, que um cliente acesse funcionalidades exclusivas do organizador ou da portaria.

## QR Code

O QR Code carrega informações relacionadas ao ingresso e é validado pelo Back-End.

A validação não depende apenas das informações presentes visualmente no QR Code.

## Front-End

O Front-End foi desenvolvido com Next.js e componentes React, mantendo as responsabilidades de comunicação com a API centralizadas no helper `apiFetch`.

A URL da API é configurável por variável de ambiente para facilitar o funcionamento tanto localmente quanto em produção.

---

# UI/UX

A interface foi desenvolvida buscando evitar uma aparência genérica de aplicação gerada automaticamente.

Foram consideradas:

* hierarquia visual;
* diferenciação dos papéis de usuário;
* feedback visual para ações;
* estados de carregamento;
* mensagens de erro;
* confirmação de operações;
* fluxo de navegação;
* responsividade;
* identidade visual própria do projeto.

A área de portaria possui uma interface específica para uso durante a validação de ingressos, priorizando clareza e rapidez na identificação do resultado.

---

# Uso de Inteligência Artificial

A Inteligência Artificial foi utilizada como ferramenta de apoio durante o desenvolvimento.

Entre os usos estão:

* discussão e revisão da arquitetura;
* auxílio na identificação de erros;
* explicação de conceitos e tecnologias;
* apoio na implementação de funcionalidades;
* revisão de código;
* sugestões de melhorias;
* apoio na documentação.

As decisões de arquitetura, organização do projeto, escolha das funcionalidades e validação do comportamento da aplicação foram realizadas durante o desenvolvimento e testadas manualmente.

O projeto foi desenvolvido de forma iterativa, com implementação, execução, identificação de problemas e correção dos fluxos.

---

# 📦 Docker

O projeto possui configuração Docker para facilitar a execução do ambiente de banco de dados local.

O Docker Compose é utilizado principalmente para disponibilizar o PostgreSQL necessário para o Back-End.

Para iniciar:

```bash
docker compose up -d
```

Para encerrar:

```bash
docker compose down
```

---

# Deploy

O projeto pode ser executado em produção separando Front-End e Back-End.

### Front-End

Deploy realizado utilizando:

**Vercel**

A variável de ambiente utilizada em produção é:

```env
NEXT_PUBLIC_API_URL=https://SUA-API.onrender.com
```

### Back-End

Deploy realizado utilizando:

**Render**

As variáveis de ambiente devem ser configuradas diretamente no ambiente de produção.

---

# Considerações finais

O objetivo principal da implementação foi entregar o fluxo completo da plataforma funcionando de ponta a ponta, priorizando uma solução simples, organizada e fácil de avaliar.

O projeto foi desenvolvido seguindo a ideia de primeiro garantir o fluxo principal funcionando e, posteriormente, adicionar melhorias de experiência, validações, tratamento de erros e recursos opcionais.

---

## Desafio

Projeto desenvolvido como parte do desafio técnico **Elite Dev**.

Repositório:

```text
<URL_DO_REPOSITORIO>
```
