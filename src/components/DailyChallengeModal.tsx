'use client';

import { useMemo } from "react";
import styles from "./DailyChallengeModal.module.css";

type ChallengeId = "feed" | "omikuji" | "record";

export type DailyChallengeState = {
    completed: Partial<Record<ChallengeId, boolean>>;
};

type Props = {
    open: boolean;
    onClose: () => void;
    // 未達成の時だけ押せる誘導ハンドラ
    onGoFeed?: () => void;
    onGoOmikuji?: () => void;
    onGoRecord?: () => void;
    state?: DailyChallengeState;
};

export default function DailyChallengeModal({
    open, onClose, onGoFeed, onGoOmikuji, onGoRecord, state,
}: Props) {
    if (!open) return null;

    const completed = state?.completed || {};
    // 右側は ↪（誘導） or 完了表示 のみ

    return (
        <div className={styles.backdrop} onClick={onClose} aria-modal="true" role="dialog">
            <div className={styles.panel} onClick={(e) => e.stopPropagation()} role="document">
                <div className={styles.header}>
                    <h2 className={styles.h2}>まいにちチャレンジ</h2>
                </div>

                <div className={styles.section}>
                    <ChallengeRow
                        label="ご飯をあげよう"
                        done={!!completed.feed}
                        onAction={!completed.feed ? onGoFeed : undefined}
                    />

                    <ChallengeRow
                        label="おみくじを引こう"
                        done={!!completed.omikuji}
                        onAction={!completed.omikuji ? onGoOmikuji : undefined}
                    />

                    <ChallengeRow
                        label="徳を記録しよう"
                        done={!!completed.record}
                        onAction={!completed.record ? onGoRecord : undefined}
                    />
                </div>

                <div className={styles.footer}>
                    <button className={styles.closeBtn} onClick={onClose}>閉じる</button>
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
        <div className={`${styles.card} ${done ? styles.cardDone : ""}`}>
            <div className={styles.cardLabel}>{label}</div>
            {done ? (
                <span className={styles.doneBadge}>完了</span>
            ) : (
                <button
                    className={`${styles.smallBtn} ${styles.smallBtnIcon}`}
                    onClick={onAction}
                    disabled={disabled}
                    aria-disabled={disabled}
                    title="進む"
                >
                    ↪
                </button>
            )}
        </div>
    );
}
