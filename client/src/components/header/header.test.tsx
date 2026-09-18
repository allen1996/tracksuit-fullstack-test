import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Header, HEADER_TEXT } from "$components/header/header.tsx";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

beforeEach(() => {
  const values = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  delete document.documentElement.dataset.theme;
});

describe("header", () => {
  it("renders", () => {
    const { getByText } = render(<Header />);
    expect(getByText(HEADER_TEXT)).toBeTruthy();
  });

  it("persists theme choices and can return to the system preference", () => {
    localStorage.setItem("suit-tracker-theme", "dark");
    render(<Header />);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(screen.getByRole("button", { name: "Dark theme" }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Light theme" }));
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem("suit-tracker-theme")).toBe("light");
    fireEvent.click(screen.getByRole("button", { name: "System theme" }));
    expect(document.documentElement.dataset.theme).toBe("system");
    expect(localStorage.getItem("suit-tracker-theme")).toBe("system");
  });
});
