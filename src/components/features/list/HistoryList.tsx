"use client";

import styles from "./HistoryList.module.css";
import { findLabelByKey } from "@/constants/categories";
import type {
  TabType,
  RecordItem,
  FortuneItem,
} from "@/hooks/list/useHistoryList";

type Props = {
  activeTab: TabType;
  records: RecordItem[];
  fortunes: FortuneItem[];
  loading: boolean;
  tree: any;
  onDelete: (id: string, isFortune: boolean) => void;
};

export default function HistoryList({
  activeTab,
  records,
  fortunes,
  loading,
  tree,
  onDelete,
}: Props) {
  if (loading) {
    return <div className={styles.loading}>読み込み中...</div>;
  }

  const renderRecords = () => {
    if (records.length === 0) {
      return <p className={styles.empty}>この月の記録はありません。</p>;
    }
    return records.map((r) => {
      const d = new Date(r.occurredOn.seconds * 1000);
      const dateStr = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
      const label = findLabelByKey(r.category, tree);

      return (
        <div key={r.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.date}>{dateStr}</span>
          </div>
          <div className={styles.cardBody}>
            <strong>{label}</strong>
            {r.subcategory && ` > ${findLabelByKey(r.subcategory, tree)}`}
            {r.content && <p className={styles.memo}>{r.content}</p>}
            {r.hasBonus && (
              <span style={{ fontSize: "12px", color: "#f59e0b" }}>
                ★ 占いボーナス！
              </span>
            )}
          </div>
          <div className={styles.actionRow}>
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.deleteBtn}`}
              onClick={() => onDelete(r.id, false)}
            >
              削除
            </button>
          </div>
        </div>
      );
    });
  };

  const renderFortunes = () => {
    if (fortunes.length === 0) {
      return <p className={styles.empty}>この月の占い記録はありません。</p>;
    }
    return fortunes.map((f) => (
      <div key={f.id} className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.date}>
            {f.date
              .replace(/-/g, "年")
              .replace(/$/, "日")
              .replace(/年(\d+)年/, "年$1月")}
          </span>
        </div>
        <div className={styles.cardBody}>
          <strong>{f.result}</strong>
          <p className={styles.memo}>過去の徳積み: {f.tokuCount}回</p>
        </div>
        <div className={styles.actionRow}>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={() => onDelete(f.id, true)}
          >
            削除
          </button>
        </div>
      </div>
    ));
  };

  return (
    <main className={styles.scrollArea}>
      {activeTab === "fortune" ? renderFortunes() : renderRecords()}
    </main>
  );
}
