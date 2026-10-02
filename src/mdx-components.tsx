import type { MDXComponents } from "mdx/types";

import { Aside } from "@/components/mdx/aside";
import { CutPlanFigure } from "@/components/mdx/cut-plan-figure";
import { H2, H3 } from "@/components/mdx/heading";
import { MdxLink } from "@/components/mdx/link";

// Required by @next/mdx in the App Router. Long-form pages style their MDX
// with the `prose` utility; these add heading ids, client-side links and the
// few components case studies and notes can use without importing them.
const components: MDXComponents = {
  h2: H2,
  h3: H3,
  a: MdxLink,
  Aside,
  CutPlanFigure,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
