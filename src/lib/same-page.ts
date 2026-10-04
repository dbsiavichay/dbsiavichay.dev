/**
 * Next's router does nothing when it's asked for the URL it's already on: a
 * link to the section the address already points at, or to the top of the
 * page being read, wouldn't move. This scrolls there instead, and says
 * whether it did, so the caller only pushes a URL that is actually new.
 */
export function scrollIfCurrent(href: string): boolean {
  const url = new URL(href, location.href);
  if (
    url.origin !== location.origin ||
    url.pathname !== location.pathname ||
    url.search !== location.search ||
    url.hash !== location.hash
  ) {
    return false;
  }
  const id = decodeURIComponent(url.hash.slice(1));
  const target = id ? document.getElementById(id) : null;
  if (target) target.scrollIntoView();
  else window.scrollTo(0, 0);
  return true;
}
