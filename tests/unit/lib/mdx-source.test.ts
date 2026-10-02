import { describe, expect, it } from "vitest";

import {
  extractBody,
  extractHeadings,
  plainText,
  readingMinutes,
  slugify,
} from "@/lib/mdx-source";

const source = `import { pending } from "@/lib/pending";

export const meta = {
  title: "Ignored",
  stack: ["FastAPI"],
};

{/* A comment that is not prose. */}

## The problem

Some words.

\`\`\`text
## Not a heading
\`\`\`

## Why \`gen_fills\` and [not this](/en)

<Aside label="Trade-off">
More words.
</Aside>
`;

describe("mdx source", () => {
  it("slugifies headings in both languages", () => {
    expect(slugify("The problem was the price, not the layout")).toBe(
      "the-problem-was-the-price-not-the-layout",
    );
    expect(slugify("¿Por qué el medio tablero?")).toBe(
      "por-que-el-medio-tablero",
    );
    expect(slugify("Trade-offs, por escrito")).toBe("trade-offs-por-escrito");
  });

  it("reduces inline markdown to what a reader sees", () => {
    expect(plainText("Why `gen_fills` and [not this](/en)")).toBe(
      "Why gen_fills and not this",
    );
  });

  it("drops imports, meta, comments and code from the body", () => {
    const body = extractBody(source);
    expect(body).not.toContain("import");
    expect(body).not.toContain("Ignored");
    expect(body).not.toContain("not prose");
    expect(body).not.toContain("Not a heading");
  });

  it("lists second-level headings outside code blocks", () => {
    expect(extractHeadings(source)).toEqual([
      { id: "the-problem", text: "The problem" },
      { id: "why-gen-fills-and-not-this", text: "Why gen_fills and not this" },
    ]);
  });

  it("estimates at least one minute of reading", () => {
    expect(readingMinutes(source)).toBe(1);
    expect(readingMinutes(`## A\n\n${"word ".repeat(1100)}`)).toBe(5);
  });
});
