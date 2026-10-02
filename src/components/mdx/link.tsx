import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { isExternalHref } from "@/lib/utils";

/** Links inside prose: client-side navigation for the site's own pages. */
export function MdxLink({
  href = "",
  ...props
}: ComponentPropsWithoutRef<"a">) {
  if (isExternalHref(href) || href.startsWith("#")) {
    return <a href={href} {...props} />;
  }
  return <Link href={href} {...props} />;
}
