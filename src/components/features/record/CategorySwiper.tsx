// src/components/CategorySwiper.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import styles from "./CategorySwiper.module.css";

type Child = { key: string; label: string };
type Parent = { key: string; label: string; children?: readonly Child[] };

type Props = {
  parents: readonly Parent[];
  // 画面側の実装に合わせて「キー」で返す
  onPick: (parentKey: string, childKey: string) => void;
  // 備考欄へフォーカス（RefObject/MutableRefObject のいずれも可）
  memoRef?:
    | React.RefObject<HTMLTextAreaElement | null>
    | React.MutableRefObject<HTMLTextAreaElement | null>;
};

const OTHER_LABEL = "その他";

export default function CategorySwiper({ parents, onPick, memoRef }: Props) {
  // 0: 親一覧, 1: 子一覧
  const [paneIndex, setPaneIndex] = useState<0 | 1>(0);
  const [activeParent, setActiveParent] = useState<Parent | null>(null);
  const [selected, setSelected] = useState<{
    parentKey?: string;
    childKey?: string;
  }>({});

  // ドラッグ（スワイプ）制御
  const panesRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const dragging = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);

  const children: readonly Child[] = useMemo(
    () => activeParent?.children ?? [],
    [activeParent],
  );

  const focusMemo = () => {
    // iOS/Safari でもキーボードが確実に開くように2段階 focus
    const el = memoRef?.current;
    if (!el) return;
    el.focus();
    requestAnimationFrame(() => {
      el.focus();
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  // 親クリック：子が無ければ備考へ（基本は全親に子がいる前提だが保険）
  const handleParentClick = (p: Parent) => {
    const hasChildren = !!(p.children && p.children.length > 0);

    // 親を押した瞬間に「選択中：親」へ反映
    onPick(p.key, "");
    setSelected({ parentKey: p.key, childKey: undefined });

    if (!hasChildren) {
      // 親が「その他」など子なし → 備考へフォーカスして終了
      focusMemo();
      return;
    }

    // 子がある → 子面へ遷移
    setActiveParent(p);
    setPaneIndex(1);
  };

  // 子クリック：「その他」は備考へフォーカス
  const handleChildClick = (c: Child) => {
    if (!activeParent) return;

    // onPick(activeParent.label, c.label);
    onPick(activeParent.key, c.key);
    setSelected({ parentKey: activeParent.key, childKey: c.key });

    if (c.label === OTHER_LABEL) {
      focusMemo();
    }
  };

  const handleBack = () => {
    setPaneIndex(0);
    setActiveParent(null);
  };

  // ===== スワイプ操作 =====
  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    dragging.current = true;
    startX.current = e.clientX;
    panesRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragging.current || startX.current == null) return;
    const dx = e.clientX - startX.current;
    if ((paneIndex === 0 && dx < 0) || (paneIndex === 1 && dx > 0)) {
      setDragOffset(dx);
    }
  };

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = () => {
    if (!dragging.current || startX.current == null) return;
    const dx = dragOffset;
    dragging.current = false;
    startX.current = null;

    const SWIPE = 48; // px 以上でページ送り

    if (paneIndex === 0 && dx <= -SWIPE) {
      if (activeParent && children.length > 0) setPaneIndex(1);
    } else if (paneIndex === 1 && dx >= SWIPE) {
      handleBack();
    }
    setDragOffset(0);
  };

  const translate = `translateX(calc(-${paneIndex * 50}% + ${dragOffset}px))`;

  return (
    <div className={styles.carousel}>
      <div
        ref={panesRef}
        className={styles.panes}
        style={{ transform: translate }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* 親カテゴリ面 */}
        <section className={styles.pane} aria-label="親カテゴリ">
          <ul className={`${styles.grid} ${styles.parents}`}>
            {parents.map((p) => {
              const isActive =
                selected.parentKey === p.key || activeParent?.key === p.key;
              const wide = p.label === "その他"; // ← 親“その他”だけ横幅フル
              return (
                <li key={p.key} className={wide ? styles.full : undefined}>
                  <button
                    type="button"
                    className={isActive ? styles.chipActive : styles.chip}
                    onClick={() => handleParentClick(p)}
                  >
                    {p.label}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className={styles.dots}>
            <span className={paneIndex === 0 ? styles.dotActive : styles.dot} />
            <span className={paneIndex === 1 ? styles.dotActive : styles.dot} />
          </div>
        </section>

        {/* 子カテゴリ面 */}
        <section className={styles.pane} aria-label="小カテゴリ">
          <div className={styles.childHeader}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={handleBack}
              aria-label="親カテゴリへ戻る"
            >
              ← 戻る
            </button>
            <h3 className={styles.parentTitle}>{activeParent?.label ?? ""}</h3>
          </div>

          <ul className={styles.grid}>
            {children.map((c) => {
              const isActive =
                selected.parentKey === activeParent?.key &&
                selected.childKey === c.key;
              return (
                <li key={c.key}>
                  <button
                    type="button"
                    className={`${styles.chip} ${isActive ? styles.chipActive : ""} ${styles.childChip}`}
                    onClick={() => handleChildClick(c)}
                  >
                    {c.label}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className={styles.dots}>
            <span className={paneIndex === 0 ? styles.dotActive : styles.dot} />
            <span className={paneIndex === 1 ? styles.dotActive : styles.dot} />
          </div>
        </section>
      </div>
    </div>
  );
}
