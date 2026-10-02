import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DateRange } from "@/components/home/date-range";
import { pending } from "@/lib/pending";

function text(ui: React.ReactElement) {
  return render(ui).container.textContent;
}

describe("DateRange", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prints a confirmed range in the page's language", () => {
    expect(
      text(
        <DateRange
          range={{ start: "2019-09", end: "2021-09" }}
          locale="es"
          presentLabel="actualidad"
        />,
      ),
    ).toBe("sept 2019 – sept 2021");
  });

  it("names an ongoing range", () => {
    expect(
      text(
        <DateRange
          range={{ start: "2025", end: "present" }}
          locale="en"
          presentLabel="present"
        />,
      ),
    ).toBe("2025 – present");
  });

  it("marks an unconfirmed edge while developing", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(
      text(
        <DateRange
          range={{ start: "2021-10", end: pending("end month") }}
          locale="en"
          presentLabel="present"
        />,
      ),
    ).toContain("end month");
  });

  it("publishes no partial range in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const { container } = render(
      <DateRange
        range={{ start: "2008", end: pending("graduation year") }}
        locale="en"
        presentLabel="present"
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
