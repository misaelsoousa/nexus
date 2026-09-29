export type ContentStatus = "Publicado" | "Em revisão" | "Rascunho";

export type DashboardContent = {
  id: string;
  title: string;
  collection: string;
  status: ContentStatus;
  updated: string;
  author: string;
  excerpt: string;
};

export type ContentFilter = "Todos" | ContentStatus;

export type UpdatesProps = {
  contents: DashboardContent[];
  filter: ContentFilter;
  onFilter: (filter: ContentFilter) => void;
  onOpen: (content: DashboardContent) => void;
};

export type PublicationSummaryProps = {
  data: {
    publication: { count: number; drafts: number; scheduled: number };
    pendingReview: number;
  };
  onReview: () => void;
};

export type HeaderProps = {
  siteName: string;
  href: string;
};

