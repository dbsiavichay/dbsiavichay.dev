type SkipLinkProps = { label: string };

/** First tab stop on every page: jumps over the header to `<main>`. */
export function SkipLink({ label }: SkipLinkProps) {
  return (
    <a
      href="#main"
      className="sr-only z-50 rounded-md bg-accent px-4 py-2 font-medium text-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      {label}
    </a>
  );
}
