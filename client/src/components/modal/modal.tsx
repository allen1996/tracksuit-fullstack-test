import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cx } from "$lib/cx.ts";
import styles from "./modal.module.css";

export type ModalProps = {
  /** Whether modal is open */
  open: boolean;
  /** Callback when modal closes */
  onClose(): void;
  /** Use a narrower dialog for short confirmations */
  size?: "default" | "small";
  /** Accessible name for the dialog */
  ariaLabel?: string;
  /** Content of the modal */
  children?: ReactNode;
};

const ANIMATIONS = {
  overlay: {
    closed: { opacity: 0 },
    open: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
      },
    },
  },
  modal: {
    closed: { opacity: 0, y: 20 },
    open: { opacity: 1, y: 0 },
  },
};

/**
 * @component
 * Modal that opens in a portal
 */
export const Modal = ({ open, onClose, size = "default", ariaLabel, children }: ModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const dialog = dialogRef.current;
    const focusable = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
        ) ?? [],
      );
    // Start in the form when present, otherwise on the safe close action.
    (dialog?.querySelector<HTMLElement>("select, textarea, input") ?? focusable()[0] ?? dialog)?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
      }
      if (event.key === "Tab") {
        const elements = focusable();
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (!first) {
          event.preventDefault();
          dialog?.focus();
        } else if (event.shiftKey && (document.activeElement === first || !dialog?.contains(document.activeElement))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !dialog?.contains(document.activeElement))) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <LayoutGroup>
          <motion.div
            className={cx(styles.overlay, size === "small" && styles.centered)}
            variants={ANIMATIONS.overlay}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onClose}
            data-testid="overlay"
          >
            <motion.div
              className={cx(styles.modal, size === "small" && styles.small)}
              ref={dialogRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel}
              variants={reduceMotion ? { closed: { opacity: 0 }, open: { opacity: 1 } } : ANIMATIONS.modal}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <button type="button" className={styles.close} aria-label="Close dialog" onClick={onClose}>
                <XIcon size={20} aria-hidden="true" />
              </button>

              <div className={cx(styles.content)}>{children}</div>
            </motion.div>
          </motion.div>
        </LayoutGroup>
      )}
    </AnimatePresence>,
    document.body,
  );
};
