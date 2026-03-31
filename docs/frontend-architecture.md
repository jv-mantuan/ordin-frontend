# Frontend Architecture — Ordin

Documento de referência para o projeto de front-end do Ordin, baseado no contrato da API.

---

## Features

### Pages / Telas

**Dashboard (Home)**
- Resumo de saldo: total de receitas vs despesas
- Gráfico de transações por período (mês atual)
- Breakdown por categoria (pizza/donut chart)
- Lista das últimas transações

**Transações**
- Lista com filtros por tipo (Income/Expense), categoria e data
- Formulário de criação/edição com campos: nome, valor, tipo, data e categoria (select)
- Confirmação de exclusão

**Categorias**
- Lista de categorias
- Formulário de criação/edição (apenas nome)
- Confirmação de exclusão — avisar que transações vinculadas ficam sem categoria

### Componentes Transversais

- **Autenticação** — telas de login/registro preparadas para quando o backend implementar (`ICurrentUserService` está hardcoded hoje)
- **Feedback de erros** — o backend retorna `ApiResponse<T>` com `requestId`, exibir mensagens contextuais e o `requestId` para debugging
- **Loading states** — skeletons/spinners em todas as chamadas async
- **Toast/notificações** — confirmações de criação, edição e exclusão

### Observações do Domínio

| Detalhe do backend | Impacto no front |
|---|---|
| `TransactionType` enum (Income/Expense) | Select ou toggle visual na criação |
| `Money` não aceita valor negativo | Validar no campo de valor antes de enviar |
| `TransactionWithCategoryNameDto` já traz o nome da categoria | Não precisa de chamada extra para montar a lista |
| Soft delete — itens somem da listagem | Apenas confirmação antes de deletar, sem lixeira |
| Sem paginação nos endpoints atuais | Lista pode ficar pesada; implementar paginação no backend antes de crescer |

---

## Stack

- **React + TypeScript**
- **TanStack Query** — cache e sincronização com a API (substitui Redux para estado de servidor)
- **React Hook Form + Zod** — formulários e validação espelhando as regras do domínio
- **React Router v7** — roteamento
- **Axios** — HTTP client com interceptors

---

## Estrutura de Pastas

```
src/
├── api/                     # Camada de acesso à API
│   ├── client.ts            # Instância do axios com interceptors
│   ├── transactions.ts      # Funções: getAll, getById, create, update, delete
│   └── categories.ts
│
├── hooks/                   # Hooks de negócio (encapsulam TanStack Query)
│   ├── useTransactions.ts   # useTransactions(), useTransaction(id), useCreateTransaction()...
│   └── useCategories.ts
│
├── pages/                   # Uma pasta por rota
│   ├── Dashboard/
│   ├── Transactions/
│   └── Categories/
│
├── components/              # Componentes reutilizáveis sem lógica de negócio
│   ├── ui/                  # Primitivos: Button, Input, Modal, Toast...
│   └── shared/              # Compostos: TransactionCard, CategoryBadge...
│
├── schemas/                 # Schemas Zod espelhando as regras do domínio
│   ├── transaction.schema.ts
│   └── category.schema.ts
│
└── types/                   # Interfaces geradas do contrato da API
    ├── transaction.ts
    └── category.ts
```

---

## Camadas e Responsabilidades

### `api/` — comunicação pura

Cada função mapeia 1:1 com um endpoint. Sem lógica de UI.

```ts
// api/transactions.ts
export const transactionsApi = {
  getAll: () =>
    client.get<ApiResponse<TransactionWithCategoryNameDto[]>>('/v1/transactions'),
  getById: (id: string) =>
    client.get<ApiResponse<TransactionWithCategoryNameDto>>(`/v1/transactions/${id}`),
  create: (data: TransactionRequest) =>
    client.post<ApiResponse<TransactionDto>>('/v1/transactions', data),
  update: (id: string, data: TransactionRequest) =>
    client.put<ApiResponse<TransactionDto>>(`/v1/transactions/${id}`, data),
  delete: (id: string) =>
    client.delete(`/v1/transactions/${id}`),
}
```

### `hooks/` — lógica de negócio do front

Os componentes nunca chamam `api/` diretamente. Tudo passa pelos hooks.

```ts
// hooks/useTransactions.ts
export const useTransactions = () =>
  useQuery({ queryKey: ['transactions'], queryFn: transactionsApi.getAll })

export const useCreateTransaction = () =>
  useMutation({
    mutationFn: transactionsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  })
```

### `schemas/` — validação espelhando o domínio

Zod reflete as regras do backend antes de enviar.

```ts
// schemas/transaction.schema.ts
export const transactionSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),       // Money: não aceita negativo
  type: z.enum(['Income', 'Expense']), // TransactionType enum
  date: z.string().datetime(),
  categoryId: z.string().uuid(),
})
```

### `pages/` — composição, sem lógica

```ts
// pages/Transactions/index.tsx
export const TransactionsPage = () => {
  const { data, isLoading } = useTransactions()
  // apenas composição de componentes, sem fetch direto
}
```

---

## Decisões de Design

**`ApiResponse<T>` e RequestId**
O interceptor do axios extrai o `data` automaticamente, mas preserva o `requestId` no contexto de erro para exibir em mensagens de suporte ao usuário.

**Types espelhando o backend**
Os types em `src/types/` espelham diretamente os DTOs do backend (`TransactionDto`, `TransactionWithCategoryNameDto`, `CategoryDto`). Evita duplicar lógica e facilita manter o contrato sincronizado.

**Preparação para auth**
O `client.ts` já terá o interceptor de `Authorization: Bearer <token>` configurado, mesmo que o backend ainda não valide. Quando o backend implementar, o front não precisa mudar nada.

**Categorias como configurações**
Categorias são simples (só `name`) e podem viver como uma seção de configurações em vez de uma página dedicada. Não criar rotas antes de precisar.