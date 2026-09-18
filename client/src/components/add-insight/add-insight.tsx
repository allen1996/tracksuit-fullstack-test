import { type FormEvent, useState } from "react";
import { BRANDS } from "$lib/consts.ts";
import { Button } from "$components/button/button.tsx";
import { Modal, type ModalProps } from "$components/modal/modal.tsx";
import type { CreateInsight } from "$schemas/insight.ts";
import styles from "./add-insight.module.css";

type AddInsightProps = ModalProps & {
  onAdd(input: CreateInsight): Promise<void>;
};

export const AddInsight = ({
  onAdd,
  onClose,
  ...modalProps
}: AddInsightProps) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    if (saving) return;
    setError(null);
    onClose();
  };

  const addInsight = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const text = String(formData.get("text") ?? "").trim();

    if (!text) {
      setError("Insight is required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onAdd({ brand: Number(formData.get("brand")), text });
      form.reset();
      onClose();
    } catch {
      setError("Could not add insight. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal {...modalProps} onClose={close} ariaLabel="Add a new insight">
      <h1 className={styles.heading}>Add a new insight</h1>
      <form className={styles.form} onSubmit={addInsight}>
        <label className={styles.field}>
          Brand
          <select className={styles["field-input"]} name="brand" required>
            {BRANDS.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          Insight
          <textarea
            className={styles["field-input"]}
            name="text"
            rows={5}
            placeholder="What have you noticed about this brand?"
            required
          />
        </label>
        {error && (
          <div role="alert" className={styles["error-message"]}>
            {error}
          </div>
        )}
        <Button
          className={styles.submit}
          type="submit"
          label={saving ? "Adding..." : "Add Insight"}
          disabled={saving}
        />
      </form>
    </Modal>
  );
};
