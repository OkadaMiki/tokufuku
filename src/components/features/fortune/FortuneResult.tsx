"use client";

import styles from "./FortuneResult.module.css";

type Props = {
  categoryLabel?: string;
  onRecord: () => void;
  onHome: () => void;
};

export default function FortuneResult({
  categoryLabel,
  onRecord,
  onHome,
}: Props) {
  return (
    <div className={styles.resultOverlay}>
      <div className={styles.resultCard}>
        <div className={styles.cardContent}>
          <p className={styles.resultTitle}>今日のラッキーカテゴリ</p>
          <div className={styles.categoryName}>{categoryLabel}</div>
          <div className={styles.divider}></div>
          <p className={styles.bonusText}>
            このカテゴリで記録すると
            <br />
            経験値<span className={styles.highlight}>2倍</span>！
          </p>
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={onRecord}
          >
            いますぐ記録する
          </button>
          <button type="button" className={styles.textButton} onClick={onHome}>
            ホームに戻る
          </button>
        </div>
      </div>
    </div>
  );
}
