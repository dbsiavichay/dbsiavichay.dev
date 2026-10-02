import { isValidElement, type ReactNode } from "react";

import { slugify } from "@/lib/mdx-source";

/** The text a node renders, for headings that contain inline markup. */
export function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return textOf(node.props.children);
  }
  return "";
}

type HeadingProps = { children?: ReactNode };

/** Section headings get the id the table of contents links to. */
export function H2({ children }: HeadingProps) {
  return <h2 id={slugify(textOf(children))}>{children}</h2>;
}

export function H3({ children }: HeadingProps) {
  return <h3 id={slugify(textOf(children))}>{children}</h3>;
}
