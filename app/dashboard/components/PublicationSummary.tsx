import { ArrowRightIcon } from "@/app/components/ui/Icons";
import type { PublicationSummaryProps } from "@/types/Dashboard";

export default function PublicationSummary({ data, onReview }: PublicationSummaryProps) {
  return (
    <section className="mb-9 space-y-4 w-full">
      <div className="flex flex-col w-full gap-4 justify-center items-center">

        <div className="rounded-md bg-surface p-5 lg:p-6 w-full">
          <h2 className="text-sm font-medium">Publicação</h2>

          <div className="mt-3 flex flex-wrap items-end gap-x-5 gap-y-2">
            <p className="text-5xl font-semibold tracking-tight tabular-nums">
              {data.publication.count}
            </p>
            <div className="pb-1 text-sm">
              <p>posts publicados</p>
              <p className="mt-1 text-xs text-muted">
                {data.publication.drafts} rascunhos -{" "}
                {data.publication.scheduled} agendados
              </p>
            </div>
          </div>

        </div>

        <div className="rounded-md bg-surface p-5 lg:p-6 w-full">
          <h2 className="text-sm font-medium">Aguardando Revisão</h2>

          <div className="mt-3 flex flex-wrap items-end gap-x-5 gap-y-2">
            <p className="text-5xl font-semibold tracking-tight tabular-nums">
              {String(data.pendingReview).padStart(2, "0")}
            </p>
            <div className="pb-1 text-sm">
              <p>posts aguardando revisão</p>
              <button
                type="button"
                onClick={onReview}
                className="mt-1 flex items-center gap-2 text-xs underline underline-offset-4 hover:text-muted"
              >
                Revisar conteúdo
                <ArrowRightIcon className="size-3" aria-hidden="true" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

