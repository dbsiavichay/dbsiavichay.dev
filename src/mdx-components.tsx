import type { MDXComponents } from "mdx/types";

import { ArchitectureDiagram } from "@/components/mdx/architecture-diagram";
import { Aside } from "@/components/mdx/aside";
import { CutPlan } from "@/components/mdx/cut-plan";
import { H2, H3 } from "@/components/mdx/heading";
import { MdxLink } from "@/components/mdx/link";
import { OrderPipeline } from "@/components/mdx/order-pipeline";

// Required by @next/mdx in the App Router. Long-form pages style their MDX
// with the `prose` utility; these add heading ids, client-side links and the
// few components case studies and notes can use without importing them.
const components: MDXComponents = {
  h2: H2,
  h3: H3,
  a: MdxLink,
  Aside,
  ArchitectureDiagram,
  CutPlan,
  OrderPipeline,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
