import { Container } from "@/components/ui/container";
import { DimensionLine } from "@/components/ui/dimension-line";
import { getI18n } from "@/i18n/server";

// Placeholder until the home sections land (phase 3).
export default async function HomePage() {
  const { dict } = await getI18n();

  return (
    <div className="flex flex-1 items-center blueprint-grid">
      <Container className="py-section">
        <p className="label-mono text-fg-subtle">{dict.placeholder.role}</p>
        <h1 className="mt-4 text-display font-semibold text-balance">
          {dict.meta.siteName}
        </h1>
        <DimensionLine className="mt-10 max-w-md" />
        <p className="mt-10 max-w-xl text-lg text-pretty text-fg-muted">
          {dict.placeholder.body}
        </p>
      </Container>
    </div>
  );
}
