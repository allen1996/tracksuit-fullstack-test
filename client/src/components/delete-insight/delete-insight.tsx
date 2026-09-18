import { useState } from "react";
import { Button } from "$components/button/button.tsx";
import { Modal } from "$components/modal/modal.tsx";
import type { Insight } from "$schemas/insight.ts";
import styles from "./delete-insight.module.css";

type DeleteInsightProps = {
  insight: Insight | null;
  onClose(): void;
  onDelete(id: number): Promise<void>;
};

export const DeleteInsight = ({
  insight,
  onClose,
  onDelete,
}: DeleteInsightProps) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(false);

  const close = () => {
    if (deleting) return;
    setError(false);
    onClose();
  };

  const confirmDelete = async () => {
    if (!insight || deleting) return;
    setDeleting(true);
    setError(false);
    try {
      await onDelete(insight.id);
      onClose();
    } catch {
      setError(true);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      open={insight !== null}
      onClose={close}
      size="small"
      ariaLabel="Delete insight"
    >
      <h2 className={styles.heading}>Delete insight?</h2>
      <p>Are you sure to delete this insight?</p>
      {error && (
        <p className={styles.error} role="alert">
          Could not delete insight. Please try again.
        </p>
      )}
      <div className={styles.actions}>
        <Button
          type="button"
          theme="secondary"
          label="Cancel"
          onClick={close}
          disabled={deleting}
        />
        <Button
          type="button"
          theme="danger"
          label={deleting ? "Deleting..." : "Delete"}
          onClick={confirmDelete}
          disabled={deleting}
        />
      </div>
    </Modal>
  );
};
