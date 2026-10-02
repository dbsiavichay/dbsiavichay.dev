import type { MDXComponents } from "mdx/types";

// Required by @next/mdx in the App Router. Long-form pages style their MDX
// with the `prose` utility, so no element needs remapping yet.
const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
  return components;
}
