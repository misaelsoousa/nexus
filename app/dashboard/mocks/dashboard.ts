import type { ContentStatus, DashboardContent } from "@/types/Dashboard";

export const dashboardMock = {
  site: {
    name: "Site de teste",
    title: "Título do site de teste",
    description: "Descrição do site de teste.",
    theme: "Tema de teste",
    lastPublished: "Última publicação há 2 horas",
    navigation: ["Início", "Sobre", "Contato"],
    actions: [
      {
        label: "Personalizar tema",
        description: "Configurações do tema de teste.",
      },
      {
        label: "Editar menus",
        description: "Configurações do menu de teste.",
      },
      {
        label: "Tipos de conteúdo",
        description: "Tipos de conteúdo de teste.",
      },
      {
        label: "Ver site",
        description: "Prévia do site de teste.",
      },
    ],
  },
  publication: { count: 128, drafts: 12, scheduled: 6 },
  pendingReview: 2,
  resume: {
    id: "post-6",
    title: "Teste de post 6",
    collection: "Categoria de teste",
    status: "Rascunho" as ContentStatus,
    updated: "há 20 min",
    author: "Usuário de teste",
    excerpt: "Conteúdo de teste do post 6.",
  },
  contents: [
    {
      id: "post-1",
      title: "Teste de post 1",
      collection: "Categoria de teste",
      status: "Publicado",
      updated: "há 2 horas",
      author: "Usuário de teste",
      excerpt: "Conteúdo de teste do post 1.",
    },
    {
      id: "post-2",
      title: "Teste de post 2",
      collection: "Categoria de teste",
      status: "Em revisão",
      updated: "há 5 horas",
      author: "Usuário de teste",
      excerpt: "Conteúdo de teste do post 2.",
    },
    {
      id: "post-3",
      title: "Teste de post 3",
      collection: "Categoria de teste",
      status: "Rascunho",
      updated: "há 1 dia",
      author: "Usuário de teste",
      excerpt: "Conteúdo de teste do post 3.",
    },
    {
      id: "post-4",
      title: "Teste de post 4",
      collection: "Categoria de teste",
      status: "Publicado",
      updated: "há 2 dias",
      author: "Usuário de teste",
      excerpt: "Conteúdo de teste do post 4.",
    },
    {
      id: "post-5",
      title: "Teste de post 5",
      collection: "Categoria de teste",
      status: "Em revisão",
      updated: "há 3 dias",
      author: "Usuário de teste",
      excerpt: "Conteúdo de teste do post 5.",
    },
  ] satisfies DashboardContent[],
};
