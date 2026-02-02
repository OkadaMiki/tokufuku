"use client";

import { useEffect, useId, useRef } from "react";
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
  const headingId = useId();

  const completed = state?.completed || {};
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

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

  // アクセシビリティ・キーボードフォーカス
  useEffect(() => {
    const prevActive = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    queueMicrotask(() => {
      // 優先：閉じるボタン
      if (closeBtnRef.current) {
        closeBtnRef.current.focus();
        return;
      }

      // 保険：dialog自身
      dialogRef.current?.focus();
    });

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      prevActive?.focus();
    };
  }, [onClose]);


  return (
    <div
      className={styles.backdrop}
      onClick={onClose}

    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: modal panel */}
      <div
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
        aria-modal="true"
        role="dialog"
        aria-labelledby={headingId}
      >
        <h2 className={styles.headingBadge} id="headingId">まいにちチャレンジ</h2>

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
              label={`3個を完了させよう ( ${doneCount}/3 )`}
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
  const disabled = done || !onAction;

  return (
    <button
      type="button"
      className={`${styles.card} ${done ? styles.cardDone : ""}`}
      onClick={disabled ? undefined : onAction}
      disabled={disabled}
      aria-label={done ? `${label}（完了）` : `${label}へ進む`}
    >
      <span className={styles.cardLabel}>{label}</span>

      {done ? (
        <span className={styles.doneBadge}>完了</span>
      ) : (
        <span className={styles.smallBtn} aria-hidden="true">
          <span className={styles.playIcon} />
        </span>
      )}
    </button>
  );
}
