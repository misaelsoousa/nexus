import Status from "@/app/components/ui/Status";
import type { ContentFilter, ContentStatus, UpdatesProps } from "@/types/Dashboard";
import type { StatusItem } from "@/types/Status";
import { FiltersIcon } from "@/app/components/ui/Icons"

const filters: ContentFilter[] = ["Todos", "Publicado", "Rascunho", "Em revisão"];

const StatusItems: Record<ContentStatus, StatusItem> = {
  "Publicado": { name: "Publicado", color: "bg-emerald-500" },
  "Em revisão": { name: "Em revisão", color: "bg-amber-400" },
  "Rascunho": { name: "Rascunho", color: "bg-slate-400" },
};
const statusColors: Record<ContentStatus, string> = {
  "Publicado": "border-l-emerald-500",
  "Em revisão": "border-l-amber-400",
  "Rascunho": "border-l-slate-400",
};

export default function Updates({
  contents,
  filter,
  onFilter,
  onOpen,
}: UpdatesProps) {
  return (
    <section className="min-w-0">
      <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">Dashboard</h1>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {filters.map((value) => (
          <button
            type="button"
            key={value}
            onClick={() => onFilter(value)}
            className={`min-h-10 border-b-2 text-xs ${filter === value ? "border-light-blue font-semibold text-foreground" : "border-transparent text-muted hover:text-foreground"}`}
          >
            {value}
          </button>
        ))}
      </div>

      <div className={`flex ${filter === "Todos" ? "justify-between" : "justify-end"}  items-center`}>
        {filter === "Todos" && (
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {Object.values(StatusItems).map((statusItem) => (
              <Status key={statusItem.name} status={statusItem} />
            ))}
          </div>
        )}

        <FiltersIcon className=" h-5 text-slate-400 " />
      </div>

      <ul className="mt-3 space-y-2">
        {contents.map((content) => (
          <li key={content.id}>
            <button
              type="button"
              onClick={() => onOpen(content)}
              className={`border-l-4 ${statusColors[content.status]} flex w-full flex-wrap items-center justify-between gap-3 rounded-md bg-surface/60 px-4 py-5 text-left hover:bg-surface sm:flex-nowrap`}
            >
              <div className="w-full">
                <div className="flex justify-between items-center w-full">
                  <h3 className="text-md font-medium">{content.title}</h3>
                  <span className="text-sm text-gray-400">{content.updated}</span>
                </div>
                <div className="flex flex-col mt-1.5 text-xs leading-relaxed text-muted">
                  <span>{content.collection} </span>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
