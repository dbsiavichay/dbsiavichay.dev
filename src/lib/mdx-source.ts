/**
 * Reads what a page needs from the MDX source itself: the section headings
 * for the table of contents and an estimated reading time. The rendered `h2`
 * derives its id with the same `slugify`, so a contents link always lands on
 * its heading (checked end to end).
 */

export type Heading = { id: string; text: string };

/** Words a reader gets through in a minute of technical prose. */
const WORDS_PER_MINUTE = 220;

/** "¿Por qué el medio tablero?" → "por-que-el-medio-tablero". */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Markdown inline syntax reduced to the text a reader sees. */
export function plainText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/(?<!\w)(\*{1,2}|_{1,2})(\S(?:.*?\S)?)\1(?!\w)/g, "$2")
    .replace(/`/g, "")
    .trim();
}

/**
 * The prose of an MDX file: without imports, the `meta` export, JSX comments
 * and fenced code, which a reader doesn't read as running text.
 */
export function extractBody(source: string): string {
  return source
    .replace(/^import .*$/gm, "")
    .replace(/^export const meta = \{[\s\S]*?^\};$/m, "")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/^```[\s\S]*?^```$/gm, "");
}

/** Second-level headings, in order: the sections of a case study or note. */
export function extractHeadings(source: string): Heading[] {
  return [...extractBody(source).matchAll(/^## (.+)$/gm)].map(([, raw]) => {
    const text = plainText(raw!);
    return { id: slugify(text), text };
  });
}

export function readingMinutes(source: string): number {
  const words = extractBody(source)
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
