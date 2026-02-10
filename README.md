# ocean-backend

API REST simples para gerenciar personagens do Rick and Morty. 

Ela permite:
- listar, criar, atualizar e remover personagens;
- importar personagens diretamente da API oficial;
- persistir dados em MongoDB local.

## Como rodar
1) Crie um arquivo `.env` com `MONGODB_URI` (veja `.env.example`).
2) Instale dependencias: `npm install`.
3) Rode o MongoDB local e inicie a API: `npm start`.
