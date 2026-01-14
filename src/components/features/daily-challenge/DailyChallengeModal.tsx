"use client";


import type { ChallengeId, DailyChallengeState } from "@/lib/playerData";
import styles from "./DailyChallengeModal.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  // 未達成の時だけ押せる誘導ハンドラ
  onGoFeed?: () => void;
  onGoUranai?: () => void;
  onGoRecord?: () => void;
  state?: DailyChallengeState;
};

export default function DailyChallengeModal({
  open,
  onClose,
  onGoFeed,
  onGoUranai,
  onGoRecord,
  state,
}: Props) {
  if (!open) return null;

  const completed = state?.completed || {};

  // ① 追記：ベース3つの達成数を数える
  const baseIds: ChallengeId[] = ["feed", "uranai", "record"];
  const doneCount = baseIds.filter((id) => completed[id]).length;
  const metaDone = doneCount >= 3;

  // ② 追記：未達のとき、次に誘導すべきチャレンジを決める（優先順は自由に調整OK）
  const goNextIncomplete = () => {
    if (completed.uranai !== true && onGoUranai) return onGoUranai();
    if (completed.feed !== true && onGoFeed) return onGoFeed();
    if (completed.record !== true && onGoRecord) return onGoRecord();
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: modal backdrop
    <div
      className={styles.backdrop}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: modal panel */}
      <div
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <h2 className={styles.headingBadge}>まいにちチャレンジ</h2>

        <div className={styles.panelInner}>

          <div className={styles.section}>
            <ChallengeRow
              label="占いをしよう"
              done={!!completed.uranai}
              onAction={!completed.uranai ? onGoUranai : undefined}
            />

            <ChallengeRow
              label="ご飯をあげよう"
              done={!!completed.feed}
              onAction={!completed.feed ? onGoFeed : undefined}
            />

            <ChallengeRow
              label="記録をしよう"
              done={!!completed.record}
              onAction={!completed.record ? onGoRecord : undefined}
            />

            <ChallengeRow
              label={`3つとも完了しよう（${doneCount}/3）`}
              done={metaDone}
              onAction={!metaDone ? goNextIncomplete : undefined}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

type RowProps = {
  label: string;
  done: boolean;
  onAction?: () => void; // 未達成時の誘導
};

function ChallengeRow({ label, done, onAction }: RowProps) {
  const clickable = !done && !!onAction;

  return (
    <div
      className={`${styles.card} ${done ? styles.cardDone : ""} ${clickable ? styles.cardClickable : ""}`}
      onClick={clickable ? onAction : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : -1}
      aria-disabled={!clickable}
      onKeyDown={(e) => {
        if (!clickable) return;
        if (e.key === "Enter" || e.key === " ") onAction?.();
      }}
    >
      <div className={styles.cardLabel}>{label}</div>

      {done ? (
        <span className={styles.doneBadge}>完了</span>
      ) : (
        <button
          type="button"
          className={styles.smallBtn}
          onClick={(e) => {
            e.stopPropagation();
            onAction?.();
          }}
          disabled={!clickable}
          aria-disabled={!clickable}
          title="進む"
        >
          <span className={styles.playIcon} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

