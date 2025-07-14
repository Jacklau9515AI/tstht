import { Trash2Icon } from "lucide-react";
import { cx } from "../../lib/cx.ts";
import styles from "./insights.module.css";
import type { Insight } from "../../schemas/insight.ts";

type InsightsProps = {
  insights: Insight[];
  className?: string;
  onInsightDeleted?: () => void; // Callback after deletion
};

export const Insights = ({ insights, className, onInsightDeleted }: InsightsProps) => {
  const deleteInsight = async (id: number) => {
    try {
      const response = await fetch(`/api/insights/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onInsightDeleted?.(); // Call callback to refresh list
      } else {
        console.error("Failed to delete insight");
      }
    } catch (error) {
      console.error("Error deleting insight:", error);
    }
  };

  return (
    <div className={cx(className)}>
      <h1 className={styles.heading}>Insights</h1>
      <div className={styles.list}>
        {insights?.length
          ? (
            insights.map(({ id, text, date, brandId }) => (
              <div className={styles.insight} key={id}>
                <div className={styles["insight-meta"]}>
                  <span>Brand {brandId}</span>
                  <div className={styles["insight-meta-details"]}>
                    <span>{date.toString()}</span>
                    <Trash2Icon
                      className={styles["insight-delete"]}
                      onClick={() => deleteInsight(id)}
                    />
                  </div>
                </div>
                <p className={styles["insight-content"]}>{text}</p>
              </div>
            ))
          )
          : <p>We have no insight!</p>}
      </div>
    </div>
  );
};
