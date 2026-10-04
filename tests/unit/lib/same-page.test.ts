import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { scrollIfCurrent } from "@/lib/same-page";

describe("scrollIfCurrent", () => {
  const scrolled: string[] = [];

  beforeEach(() => {
    document.body.innerHTML = `<section id="work"></section><h2 id="año">x</h2>`;
    Element.prototype.scrollIntoView = function () {
      scrolled.push(this.id);
    };
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  afterEach(() => {
    scrolled.length = 0;
    vi.restoreAllMocks();
    history.replaceState(null, "", "/en");
  });

  it("scrolls to the section the address already points at", () => {
    history.replaceState(null, "", "/en#work");
    expect(scrollIfCurrent("/en#work")).toBe(true);
    expect(scrolled).toEqual(["work"]);
  });

  it("decodes the fragment, as the address bar encodes it", () => {
    history.replaceState(null, "", "/en#a%C3%B1o");
    expect(scrollIfCurrent("/en#año")).toBe(true);
    expect(scrolled).toEqual(["año"]);
  });

  it("goes to the top for the page itself", () => {
    history.replaceState(null, "", "/en");
    expect(scrollIfCurrent("/en")).toBe(true);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("leaves any other URL to the router", () => {
    history.replaceState(null, "", "/en#work");
    expect(scrollIfCurrent("/en#notes")).toBe(false);
    expect(scrollIfCurrent("/en")).toBe(false);
    expect(scrollIfCurrent("/es#work")).toBe(false);
    expect(scrollIfCurrent("https://example.com/en#work")).toBe(false);
    expect(scrolled).toEqual([]);
  });
});
