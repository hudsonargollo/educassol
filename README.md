# EDUCA SOL

Plataforma de IA para auxiliar professores na criação de conteúdo educacional alinhado à Base Nacional Comum Curricular (BNCC).

## Sobre o Projeto

EDUCA SOL é uma plataforma desenvolvida para professores da educação primária em Jequié e região, oferecendo ferramentas de IA para:

- Geração de planos de aula
- Criação de atividades educacionais
- Elaboração de avaliações
- Sugestões de habilidades BNCC

## Tecnologias

- React + TypeScript
- Vite
- Tailwind CSS
- Supabase (Backend & Auth)
- shadcn/ui

## Desenvolvimento Local

### Pré-requisitos

- Node.js 18+
- npm ou bun

### Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

O servidor estará disponível em `http://localhost:8080`

## Estrutura do Projeto

```
src/
├── components/     # Componentes React
├── hooks/          # Custom hooks
├── integrations/   # Integrações (Supabase)
├── lib/            # Utilitários
└── pages/          # Páginas da aplicação

supabase/
├── functions/      # Edge Functions
└── migrations/     # Migrações do banco
```

## Deploy

O projeto pode ser deployado em qualquer plataforma que suporte aplicações Vite/React estáticas.
