
# Ocean Backend — Rick and Morty API

API REST desenvolvida com **Node.js**, **Express** e **MongoDB** para gerenciar personagens do universo de **Rick and Morty**.

O projeto oferece operações de cadastro, consulta, atualização e exclusão, além da importação de personagens da [Rick and Morty API](https://rickandmortyapi.com/).

## Funcionalidades

- Listar personagens armazenados no MongoDB.
- Consultar um personagem pelo ID numérico.
- Criar personagens com validação dos campos obrigatórios.
- Atualizar dados de personagens existentes.
- Remover personagens cadastrados.
- Importar personagens da API externa por uma lista de IDs ou por número da página.
- Inicializar o banco com a primeira página de personagens usando um script de seed.

## Tecnologias

| Tecnologia | Utilização |
| --- | --- |
| **Node.js** | Ambiente de execução JavaScript no backend |
| **Express 5** | Definição das rotas e tratamento das requisições HTTP |
| **MongoDB** | Banco de dados NoSQL |
| **Mongoose** | Modelagem e acesso aos dados |
| **dotenv** | Carregamento de variáveis de ambiente |
| **JavaScript (ES Modules)** | Linguagem e organização dos módulos |

## Requisitos

- **Node.js 18 ou superior** (o projeto utiliza `fetch` nativo para a integração externa).
- **npm**.
- **MongoDB** acessível localmente ou por uma URI de conexão válida.
- Acesso à internet para importar personagens da API pública e executar o seed.

## Instalação e execução

1. Clone o repositório:

   ```bash
   git clone https://github.com/fhenrique77/ocean-backend.git
   cd ocean-backend
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Crie um arquivo `.env` na raiz do projeto, com base no `.env.example`:

   ```env
   MONGODB_URI=mongodb://localhost:27017/ocean
   ```

   > Caso `MONGODB_URI` não esteja definida, a aplicação utiliza `mongodb://localhost:27017/ocean` como valor padrão. Não adicione credenciais reais ao controle de versão.

4. Inicie o MongoDB e execute a aplicação:

   ```bash
   npm start
   ```

5. Acesse a API em **http://localhost:3000**. O servidor só inicia depois que a conexão com o MongoDB é estabelecida.

### Popular o banco (opcional)

Com o MongoDB acessível e a internet disponível, importe os personagens da primeira página da API pública:

```bash
npm run seed
```

O script usa importação com *upsert*: documentos existentes com o mesmo ID podem ser atualizados.

## Endpoints

**URL base:** `http://localhost:3000`

| Método | Rota | Descrição | Sucesso |
| --- | --- | --- | --- |
| `GET` | `/` | Retorna `Hello World` | `200` |
| `GET` | `/oi` | Retorna `Olá, mundo!` | `200` |
| `GET` | `/personagens` | Lista os personagens cadastrados | `200` |
| `GET` | `/personagens/:id` | Busca um personagem pelo ID | `200` |
| `POST` | `/personagens` | Cria um novo personagem | `201` |
| `PUT` | `/personagens/:id` | Atualiza os campos informados | `200` |
| `DELETE` | `/personagens/:id` | Remove um personagem | `200` |
| `POST` | `/personagens/importar` | Importa personagens por IDs ou página | `201` |

### Criar personagem

**`POST /personagens`** — envie `Content-Type: application/json`:

```json
{
  "name": "Summer Smith",
  "status": "Alive",
  "species": "Human",
  "gender": "Female",
  "origin": {
    "name": "Earth (Replacement Dimension)",
    "url": "https://rickandmortyapi.com/api/location/20"
  },
  "location": {
    "name": "Earth (Replacement Dimension)",
    "url": "https://rickandmortyapi.com/api/location/20"
  },
  "image": "https://rickandmortyapi.com/api/character/avatar/3.jpeg",
  "episode": ["https://rickandmortyapi.com/api/episode/1"]
}
```

Os campos obrigatórios na criação são `name`, `status`, `species`, `origin.name`, `location.name` e `image`. O `id` é atribuído automaticamente; `type`, `gender`, `episode`, `url` e `created` são opcionais.

A imagem deve utilizar o host `rickandmortyapi.com` e o caminho `/api/character/avatar/`. As URLs informadas precisam ser HTTP ou HTTPS válidas. `episode`, quando informado, deve ser uma lista de URLs válidas.

### Buscar e listar

```http
GET http://localhost:3000/personagens
```

```http
GET http://localhost:3000/personagens/1
```

### Atualizar personagem

**`PUT /personagens/1`** — aceita atualização parcial (é necessário informar pelo menos um campo reconhecido):

```json
{
  "status": "Alive",
  "location": {
    "name": "Earth (Replacement Dimension)",
    "url": "https://rickandmortyapi.com/api/location/20"
  }
}
```

### Excluir personagem

```http
DELETE http://localhost:3000/personagens/1
```

### Importar personagens

**`POST /personagens/importar`** — importação por IDs:

```json
{
  "ids": [1, 2, 3]
}
```

Ou importação por página:

```json
{
  "page": 1
}
```

A resposta de sucesso contém `total` e `personagens`. Os dados são recuperados de `https://rickandmortyapi.com/api/character` e gravados usando *upsert*, isto é, cada personagem é inserido ou atualizado segundo seu ID.

### Respostas de erro relevantes

| Código | Situação |
| --- | --- |
| `400` | ID ou corpo da requisição inválido; ausência de campos exigidos |
| `404` | Personagem não encontrado em consulta, atualização ou exclusão |
| `502` | Falha ao buscar personagens durante a importação na API externa |

Outros problemas de execução ou persistência podem resultar em erro interno (`500`).

## Estrutura do projeto

```text
ocean-backend/
├── controllers/
│   ├── personagensController.js  # Validações e respostas HTTP
│   └── rootController.js
├── db/
│   └── connection.js             # Conexão com o MongoDB
├── models/
│   └── Personagem.js             # Schema do personagem
├── requests/                     # Exemplos de requisições HTTP
├── routes/
│   ├── personagens.js
│   └── root.js
├── scripts/
│   └── seed.js                   # Importação inicial
├── services/
│   └── personagensService.js     # Acesso a dados e integração externa
├── .env.example
├── index.js                       # Inicialização do servidor
├── package.json
└── README.md
```

O fluxo das requisições é: **Routes → Controllers → Services → Mongoose → MongoDB**. Para importar personagens, o service também realiza requisições à API pública de Rick and Morty.

## Testando a API

O diretório [`requests/`](./requests) contém exemplos `.http` que podem ser executados com um cliente HTTP compatível, como a extensão **REST Client** do VS Code. Também é possível usar Postman, Insomnia ou `curl`.

Por exemplo:

```bash
curl http://localhost:3000/personagens
```

> O repositório ainda não possui suíte de testes automatizados ou comando `npm test` configurado.

## Observações e melhorias futuras

Este é um projeto de estudo e demonstração de desenvolvimento backend. Na versão atual:

- Não há autenticação ou autorização nas rotas.
- Não há suíte de testes automatizados configurada.
- A porta HTTP está definida no código como `3000`.
- A operação `PUT` aceita atualizações parciais.
- A importação pode atualizar registros já existentes com o mesmo ID.

Antes de disponibilizá-lo em produção, recomenda-se avaliar autenticação, testes automatizados, tratamento padronizado de erros e configuração da porta por variável de ambiente.

## Autor

Desenvolvido por [Felipe Henrique](https://github.com/fhenrique77).
