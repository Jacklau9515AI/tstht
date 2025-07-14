import { useState } from "react";
import { BRANDS } from "../../lib/consts.ts";
import { Button } from "../button/button.tsx";
import { Modal, type ModalProps } from "../modal/modal.tsx";
import styles from "./add-insight.module.css";

type AddInsightProps = ModalProps & {
  onSuccess?: () => void; // Callback after success
};

export const AddInsight = ({ onSuccess, ...props }: AddInsightProps) => {
  const [brandId, setBrandId] = useState(BRANDS[0].id);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addInsight = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brandId,
          text: text.trim(),
        }),
      });

      if (response.ok) {
        // Reset form after success
        setText("");
        setBrandId(BRANDS[0].id);
        props.onClose();
        onSuccess?.(); // Call successful callback refresh list
      } else if (response.status === 409) {
        // Duplicate content error
        const errorData = await response.json();
        alert(errorData.error || "This insight already exists");
      } else {
        console.error("Failed to create insight");
        alert("Failed to create insight. Please try again.");
      }
    } catch (error) {
      console.error("Error creating insight:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal {...props}>
      <h1 className={styles.heading}>Add a new insight</h1>
      <form className={styles.form} onSubmit={addInsight}>
        <label className={styles.field}>
          Brand
          <select
            className={styles["field-input"]}
            value={brandId}
            onChange={(e) => setBrandId(parseInt(e.target.value))}
          >
            {BRANDS.map(({ id, name }) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          Insight
          <textarea
            className={styles["field-input"]}
            rows={5}
            placeholder="Something insightful..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isSubmitting}
          />
        </label>
        <Button
          className={styles.submit}
          type="submit"
          label={isSubmitting ? "Adding..." : "Add insight"}
          disabled={isSubmitting || !text.trim()}
        />
      </form>
    </Modal>
  );
};
