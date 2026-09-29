"use client";

import { useRef, useState } from "react";
import Header from "./components/Header";
import Updates from "./components/Updates";
import PublicationSummary from "./components/PublicationSummary";
import type { ContentFilter, DashboardContent } from "@/types/Dashboard";
import Preview from "./components/Preview";
import { dashboardMock } from "./mocks/dashboard";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ContentFilter>("Todos");
  const [detail, setDetail] = useState({ title: "", description: "" });
  const dialog = useRef<HTMLDialogElement>(null);
  const recent = useRef<HTMLDivElement>(null);
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const contents = dashboardMock.contents.filter(
    (content) =>
      (filter === "Todos" || content.status === filter) &&
      normalize(`${content.title} ${content.collection}`).includes(
        normalize(search),
      ),
  );

  function showDetail(title: string, description: string) {
    setDetail({ title, description });
    dialog.current?.showModal();
  }

  function openContent(content: DashboardContent) {
    showDetail(
      content.title,
      `${content.collection} · ${content.status} · ${content.author}\n\n${content.excerpt}`,
    );
  }

  return (
    <div>
      <Header
        siteName={dashboardMock.site.name}
        href="/"
      />
      <div
        ref={recent}
        className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]"
      >
        <Updates
          contents={contents}
          filter={filter}
          onFilter={setFilter}
          onOpen={openContent}
        />

        <div>
          <PublicationSummary
            data={dashboardMock}
            onReview={() => {
              setFilter("Em revisão");
              setSearch("");
              recent.current?.scrollIntoView({ block: "nearest" });
            }}
          />
          
          <Preview />
        </div>
        
      </div>
    </div>
  );
}
