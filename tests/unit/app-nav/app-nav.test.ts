import { describe, expect, it } from "vitest";
import { activeNavItem } from "@/lib/app-nav";

describe("activeNavItem", () => {
  it("marks Home only on the Home page itself", () => {
    expect(activeNavItem("/protected")).toBe("home");
  });

  it("marks Lessons on the Lesson picker and its sub-pages", () => {
    expect(activeNavItem("/protected/sentences")).toBe("lessons");
    expect(activeNavItem("/protected/sentences/random")).toBe("lessons");
  });

  it("marks Progress on the Progress page", () => {
    expect(activeNavItem("/protected/progress")).toBe("progress");
  });

  it("marks nothing elsewhere", () => {
    expect(activeNavItem("/protected/sentencesX")).toBeNull();
    expect(activeNavItem("/auth/login")).toBeNull();
  });
});
