import { API_BASE_URL } from "@/lib/config";
import type { FormDetails } from "@/types/Form";
import type { FieldDefinition } from "@/types/PostType";
import CopyButton from "../../docs/CopyButton";
import { Card, CardHeader } from "../../components/ui";
import type { T } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { rich } from "@/lib/rich";

const INPUT_TYPES: Record<number, string> = { 0: "text", 2: "number", 4: "date", 8: "color", 10: "email", 11: "tel", 12: "url", 13: "file" };

function escapeHtml(value: string) {
    return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function fieldHtml(t: T, field: FieldDefinition) {
    const label = escapeHtml(field.label);
    const required = field.required ? " required" : "";

    switch (field.type) {
        case 9:
            return `  <h3>${label}</h3>`;
        case 1:
            return `  <label>${label}\n    <textarea name="${field.key}"${required}></textarea>\n  </label>`;
        case 3:
            return `  <label>\n    <input type="checkbox" name="${field.key}" value="true"${required}> ${label}\n  </label>`;
        case 5: {
            const options = (field.options?.choices ?? []).map((choice) => `      <option>${escapeHtml(choice)}</option>`).join("\n");
            return `  <label>${label}\n    <select name="${field.key}"${required}>\n      <option value="">${t("Selecione")}</option>\n${options}\n    </select>\n  </label>`;
        }
        case 13:
            return `  <label>${label}\n    <input type="file" name="${field.key}" accept=".pdf,.doc,.docx,.odt,.rtf,.txt,.jpg,.jpeg,.png,.webp"${required}>\n  </label>`;
        default:
            return `  <label>${label}\n    <input type="${INPUT_TYPES[field.type] ?? "text"}" name="${field.key}"${required}>\n  </label>`;
    }
}

export default async function FormIntegration({ form }: { form: FormDetails }) {
    const t = await getT();
    const schemaUrl = new URL(`form/${encodeURIComponent(form.name)}`, API_BASE_URL).toString();
    const submitUrl = `${schemaUrl}/submissions`;

    const snippet = [
        `<form id="form-${form.name}">`,
        ...form.fields.map((field) => fieldHtml(t, field)),
        `  <input type="text" name="_honeypot" tabindex="-1" autocomplete="off" style="display:none">`,
        `  <button type="submit">${t("Enviar")}</button>`,
        `</form>`,
        ``,
        `<script>`,
        `  const form = document.getElementById("form-${form.name}");`,
        ``,
        `  form.addEventListener("submit", async (event) => {`,
        `    event.preventDefault();`,
        `    const response = await fetch("${submitUrl}", { method: "POST", body: new FormData(form) });`,
        `    const data = await response.json();`,
        ``,
        `    if (response.ok) {`,
        `      form.reset();`,
        `      alert(data.message);`,
        `    } else {`,
        `      alert(data.errors.join("\\n"));`,
        `    }`,
        `  });`,
        `</script>`,
    ].join("\n");

    return (
        <Card className="animate-rise mt-5 overflow-hidden">
            <CardHeader title={t("Como usar no site")} />
            <div className="flex flex-col gap-4 p-4 text-[13px]">
                <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[auto_1fr]">
                    <dt className="text-muted">{t("Enviar")}</dt>
                    <dd className="flex items-center gap-1 break-all font-mono">
                        POST {submitUrl}
                        <CopyButton value={submitUrl} label={t("Copiar URL de envio")} />
                    </dd>
                    <dt className="text-muted">{t("Campos")}</dt>
                    <dd className="flex items-center gap-1 break-all font-mono">
                        GET {schemaUrl}
                        <CopyButton value={schemaUrl} label={t("Copiar URL dos campos")} />
                    </dd>
                </dl>
                <p className="text-muted">
                    {rich(t("Envie como {multipart} (obrigatório quando há arquivos) ou JSON, usando as chaves dos campos como nomes."), { multipart: <code className="font-mono">multipart/form-data</code> })}{" "}
                    {rich(t("A API valida tudo de novo e responde {created} com {message}, ou {invalid} com {errors}."), {
                        created: <code className="font-mono">201</code>,
                        message: <code className="font-mono">{"{ message }"}</code>,
                        invalid: <code className="font-mono">400</code>,
                        errors: <code className="font-mono">{"{ errors: [...] }"}</code>,
                    })}{" "}
                    {rich(t("O campo oculto {honeypot} barra robôs: se vier preenchido, o envio é descartado em silêncio. Cada visitante pode enviar até 5 vezes por minuto."), { honeypot: <code className="font-mono">_honeypot</code> })}
                </p>
                <p className="text-muted">
                    {t("Este exemplo usa os campos salvos. Se você alterou a lista acima, salve antes de copiar.")}
                </p>
                <div className="relative rounded-md border border-line bg-surface-2">
                    <div className="absolute top-1 right-1">
                        <CopyButton value={snippet} label={t("Copiar exemplo")} />
                    </div>
                    <pre className="max-h-96 overflow-auto p-3 pr-12 font-mono text-xs leading-relaxed">{snippet}</pre>
                </div>
            </div>
        </Card>
    );
}
