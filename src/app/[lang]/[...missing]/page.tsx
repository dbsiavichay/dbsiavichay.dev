import { notFound } from "next/navigation";

// Any path under a locale that no route claims renders the localized 404,
// inside the site layout, with a 404 status.
export default function MissingPage() {
  notFound();
}
