"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import CategorySwiper from "@/components/features/record/CategorySwiper";
import Footer from "@/components/layout/FooterNav";
import LoadingMessage from "@/components/ui/LoadingMessage";
import BoxTabSelector from "@/components/ui/BoxTabSelector";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useRecordForm, type TypeKind } from "@/hooks/record/useRecordForm";
import { findLabelByKey } from "@/constants/categories";

import styles from "./page.module.css";

// コンポーネント本体
export default function RecordPage() {
  // ログイン処理
  const { user, loading } = useAuthGuard({ requireLogin: true });
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Firestoreと同期
  useEffect(() => {
    const syncData = async () => {
      if (!loading && user?.uid) {
        const { syncPlayerData } = await import("@/lib/level");
        await syncPlayerData(user.uid);
        setIsDataLoading(false);
      }
    };
    syncData();
  }, [loading, user]);

  // フォームロジック
  const {
    type,
    setType,
    dateStr,
    setDateStr,
    category,
    sub,
    memo,
    setMemo,
    saving,
    msg,
    tree,
    canSubmit,
    handlePick,
    handleSubmit,
  } = useRecordForm(user);

  // 「その他」選択時にここへフォーカス
  const memoRef = useRef<HTMLTextAreaElement | null>(null);

  if (loading || isDataLoading) return <LoadingMessage />;

  return (
    <div className={styles.page}>
      {/* ヘッダ */}
      <header className={styles.header}>
        <div className={styles.head}>
          <div className={styles.pageName}>
            <Image
              src={"/assets/headers/recordh1.svg"}
              alt={"記録画面"}
              width={168}
              height={72}
            />
          </div>
        </div>
        <BoxTabSelector
          options={[
            { label: "🌿 徳", value: "toku" },
            { label: "✨ いいこと", value: "good" },
          ]}
          value={type}
          onChange={(val) => setType(val as TypeKind)}
          className={`${styles.fullWidthTab} & ${styles.selectTab} `}
        />
      </header>

      <div className={styles.main}>
        {/* 日付 */}
        <section className={`${styles.panel} & ${styles.row} & ${styles.date}`}>
          <label className={`${styles.label} & ${styles.dateTitle}`} htmlFor="date-input">
            日付
          </label>
          <input
            id="date-input"
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className={styles.input}
          />
        </section>

        {/* カテゴリ → 横スワイプでサブ選択 */}
        <section className={`${styles.panel} & ${styles.category}`}>
          <CategorySwiper
            parents={tree as any}
            onPick={handlePick}
            memoRef={memoRef}
          />
          <p className={styles.hint}>
            選択中：{category ? findLabelByKey(category, tree) : "—"}{" "}
            {sub ? `> ${findLabelByKey(sub, tree)}` : ""}
          </p>
        </section>

        {/* 詳細メモ（任意） */}
        <section className={`${styles.panel} & ${styles.note}`}>
          <label className={`${styles.label} & ${styles.noteTitle}`} htmlFor="memo-input">
            備考（任意）
          </label>
          <textarea
            id="memo-input"
            rows={3}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className={styles.textarea}
            placeholder="自由入力"
            ref={memoRef}
          />
        </section>

        {/* アクション */}
        <section className={`${styles.actionRow} & ${styles.save}`}>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleSubmit}
            disabled={!canSubmit || saving}
          >
            {saving ? "保存中…" : "記録"}
          </button>
          {msg && <span className={styles.msg}>{msg}</span>}
        </section>
      </div>
      <Footer />
    </div>
  );
}
