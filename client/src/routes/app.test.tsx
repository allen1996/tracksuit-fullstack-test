import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./app.tsx";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("App", () => {
  it("shows loading until insights arrive", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              id: 1,
              brand: 2,
              createdAt: "2026-01-01T00:00:00.000Z",
              text: "Loaded insight",
            },
          ]),
      }),
    );

    render(<App />);
    expect(screen.getByRole("status").textContent).toBe("Loading insights...");
    expect(await screen.findByText("Loaded insight")).toBeTruthy();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("renders the insights returned by the server after loading", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              id: 1,
              brand: 1,
              createdAt: "2026-01-01T00:00:00.000Z",
              text: "First insight",
            },
            {
              id: 2,
              brand: 2,
              createdAt: "2026-01-02T00:00:00.000Z",
              text: "Second insight",
            },
          ]),
      }),
    );

    render(<App />);
    const first = await screen.findByText("First insight");
    const second = screen.getByText("Second insight");

    expect(first.parentElement?.textContent).toContain("Brand 1");
    expect(
      first.parentElement?.querySelector("time")?.getAttribute("dateTime"),
    ).toBe("2026-01-01T00:00:00.000Z");
    expect(second.parentElement?.textContent).toContain("Brand 2");
    expect(
      second.parentElement?.querySelector("time")?.getAttribute("dateTime"),
    ).toBe("2026-01-02T00:00:00.000Z");
    expect(screen.queryByText("Your next great idea starts here")).toBeNull();
  });

  it("shows the empty state after an empty response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([]) }),
    );

    render(<App />);
    expect(await screen.findByText("Your next great idea starts here")).toBeTruthy();
  });

  it("shows an error when loading fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    render(<App />);
    expect((await screen.findByRole("alert")).textContent).toBe(
      "Could not load insights.",
    );
  });

  it("adds an insight and shows it in the list", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 1,
            brand: 2,
            createdAt: "2026-01-01T00:00:00.000Z",
            text: "New insight",
          }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);
    await screen.findByText("Your next great idea starts here");
    fireEvent.click(screen.getAllByRole("button", { name: "Add insight" })[0]);
    fireEvent.change(screen.getByRole("combobox", { name: "Brand" }), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Insight" }), {
      target: { value: "New insight" },
    });
    fireEvent.click(screen.getAllByRole("button", { name: "Add insight" })[1]);

    expect(await screen.findByText("New insight")).toBeTruthy();
    expect(fetchMock).toHaveBeenLastCalledWith("/api/insights/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ brand: 2, text: "New insight" }),
    });
    await waitFor(() => expect(screen.queryByText("Add a new insight")).toBeNull());
  });

  it("confirms before deleting and removes the insight after success", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              id: 1,
              brand: 2,
              createdAt: "2026-01-01T00:00:00.000Z",
              text: "Delete me",
            },
          ]),
      })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);
    await screen.findByText("Delete me");
    fireEvent.click(screen.getByRole("button", { name: "Delete insight 1" }));
    expect(screen.getByRole("dialog", { name: "Delete insight" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByText("Delete me")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Delete insight 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(await screen.findByText("Your next great idea starts here")).toBeTruthy();
    expect(fetchMock).toHaveBeenLastCalledWith("/api/insights/1", {
      method: "DELETE",
    });
  });

  it("deletes only the selected insight", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              id: 1,
              brand: 1,
              createdAt: "2026-01-01T00:00:00.000Z",
              text: "Keep me",
            },
            {
              id: 2,
              brand: 2,
              createdAt: "2026-01-02T00:00:00.000Z",
              text: "Delete me",
            },
          ]),
      })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);
    await screen.findByText("Delete me");
    fireEvent.click(screen.getByRole("button", { name: "Delete insight 2" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(screen.queryByText("Delete me")).toBeNull());
    expect(screen.getByText("Keep me")).toBeTruthy();
    expect(fetchMock).toHaveBeenLastCalledWith("/api/insights/2", {
      method: "DELETE",
    });
  });
});
