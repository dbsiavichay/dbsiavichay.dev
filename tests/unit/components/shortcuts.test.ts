import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ignoreKey,
  resolveKey,
  SEQUENCE_MS,
  setShortcutsEnabled,
  shortcutsEnabled,
  stepSection,
} from "@/components/command/shortcuts";

describe("resolveKey", () => {
  it("maps the single keys", () => {
    expect(resolveKey("/", 0)).toBe("search");
    expect(resolveKey(":", 0)).toBe("command");
    expect(resolveKey("?", 0)).toBe("help");
    expect(resolveKey("j", 0)).toBe("next");
    expect(resolveKey("k", 0)).toBe("previous");
    expect(resolveKey("g", 0)).toBe("g");
  });

  it("ignores everything else, uppercase included", () => {
    for (const key of ["J", "G", "x", "Enter", "Escape", "constructor"]) {
      expect(resolveKey(key, 0), key).toBeUndefined();
    }
  });

  it("completes a `g` sequence within a second", () => {
    expect(resolveKey("p", 500, 0)).toEqual({ go: "work" });
    expect(resolveKey("h", SEQUENCE_MS, 0)).toEqual({ go: "" });
    expect(resolveKey("c", 10, 0)).toEqual({ go: "contact" });
  });

  it("lets a late second key stand on its own", () => {
    expect(resolveKey("p", SEQUENCE_MS + 1, 0)).toBeUndefined();
    expect(resolveKey("k", SEQUENCE_MS + 1, 0)).toBe("previous");
  });

  it("falls back to the single key when `g` is followed by one", () => {
    expect(resolveKey("j", 100, 0)).toBe("next");
    expect(resolveKey("g", 100, 0)).toBe("g");
  });
});

describe("ignoreKey", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  function press(target: EventTarget, init: KeyboardEventInit = {}) {
    let ignored: boolean | undefined;
    target.addEventListener("keydown", (event) => {
      ignored = ignoreKey(event as KeyboardEvent);
    });
    target.dispatchEvent(
      new KeyboardEvent("keydown", { key: "j", bubbles: true, ...init }),
    );
    return ignored;
  }

  it("lets a plain key on the page through", () => {
    expect(press(document.body)).toBe(false);
  });

  it("ignores keys held with a modifier, repeated or mid-composition", () => {
    expect(press(document.body, { ctrlKey: true })).toBe(true);
    expect(press(document.body, { metaKey: true })).toBe(true);
    expect(press(document.body, { altKey: true })).toBe(true);
    expect(press(document.body, { repeat: true })).toBe(true);
    expect(press(document.body, { isComposing: true })).toBe(true);
  });

  it("ignores keys typed into a field", () => {
    document.body.innerHTML = `
      <input /><textarea></textarea><select></select>
      <div contenteditable="true"><p>text</p></div>
      <div contenteditable="false"><p>read only</p></div>`;
    for (const selector of ["input", "textarea", "select"]) {
      expect(press(document.querySelector(selector)!), selector).toBe(true);
    }
    const [editable, readOnly] = document.querySelectorAll("p");
    expect(press(editable!)).toBe(true);
    expect(press(readOnly!)).toBe(false);
  });

  it("ignores keys while a dialog is open", () => {
    document.body.innerHTML = "<dialog open></dialog><button>b</button>";
    expect(press(document.querySelector("button")!)).toBe(true);
  });
});

describe("shortcutsEnabled", () => {
  afterEach(() => {
    setShortcutsEnabled(true);
    vi.restoreAllMocks();
  });

  it("is on by default and remembers being turned off", () => {
    expect(shortcutsEnabled()).toBe(true);
    setShortcutsEnabled(false);
    expect(localStorage.getItem("shortcuts")).toBe("off");
    expect(shortcutsEnabled()).toBe(false);
    setShortcutsEnabled(true);
    expect(localStorage.getItem("shortcuts")).toBeNull();
    expect(shortcutsEnabled()).toBe(true);
  });

  it("keeps the choice for the visit when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    expect(() => setShortcutsEnabled(false)).not.toThrow();
    expect(shortcutsEnabled()).toBe(false);
  });
});

describe("stepSection", () => {
  // Three sections: one above the line, one sitting on it, one below.
  const tops = [-400, 80, 900];

  it("moves to the first section below the line, or the last above it", () => {
    expect(stepSection(tops, 80, true)).toBe(2);
    expect(stepSection(tops, 80, false)).toBe(0);
  });

  it("tolerates a section a pixel off the line", () => {
    expect(stepSection([-400, 80.6, 900], 80, true)).toBe(2);
    expect(stepSection([-400, 79.4, 900], 80, false)).toBe(0);
  });

  it("answers -1 past either end", () => {
    expect(stepSection([-900, -400, 80], 80, true)).toBe(-1);
    expect(stepSection([80, 600], 80, false)).toBe(-1);
  });

  it("continues from the section a quick press went to", () => {
    expect(stepSection(tops, 80, true, 0)).toBe(1);
    expect(stepSection(tops, 80, true, 2)).toBe(-1);
    expect(stepSection(tops, 80, false, 1)).toBe(0);
    expect(stepSection(tops, 80, false, 0)).toBe(-1);
    expect(stepSection(tops, 80, false, -1)).toBe(-1);
    expect(stepSection(tops, 80, true, -1)).toBe(0);
  });
});
