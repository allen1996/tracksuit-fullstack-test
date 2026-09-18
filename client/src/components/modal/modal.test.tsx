import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Modal } from "$components/modal/modal.tsx";

afterEach(cleanup);

describe("Modal", () => {
  it("should open and close", () => {
    render(
      <Modal open={false} onClose={() => undefined}>
        Closed modal
      </Modal>,
    );
    expect(screen.queryByText("Closed modal")).toBeFalsy();

    render(
      <Modal open onClose={() => undefined}>
        <div>Open modal</div>
      </Modal>,
    );
    expect(screen.getByText("Open modal")).toBeTruthy();
  });
});

it("keeps keyboard focus inside, closes with Escape, and restores focus", () => {
  const trigger = document.createElement("button");
  document.body.appendChild(trigger);
  trigger.focus();
  const onClose = vi.fn();
  const { getByRole, unmount } = render(
    <Modal open onClose={onClose} ariaLabel="Keyboard test">
      <button type="button">Last action</button>
    </Modal>,
  );
  const close = getByRole("button", { name: "Close dialog" });
  const last = getByRole("button", { name: "Last action" });
  expect(document.activeElement).toBe(close);
  fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
  expect(document.activeElement).toBe(last);
  fireEvent.keyDown(document, { key: "Tab" });
  expect(document.activeElement).toBe(close);
  fireEvent.keyDown(document, { key: "Escape" });
  expect(onClose).toHaveBeenCalledOnce();
  unmount();
  expect(document.activeElement).toBe(trigger);
  trigger.remove();
});
