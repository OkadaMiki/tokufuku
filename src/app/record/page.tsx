"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import CategorySwiper from "@/components/CategorySwiper";
import Footer from "@/components/FooterNav";
import LoadingMessage from "@/components/LoadingMessage";
import { GOOD_CATEGORIES, TOKU_CATEGORIES } from "@/constants/categories";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { auth, db } from "@/lib/firebase";
import {
  addExp,
  completeDailyChallenge,
  getRequiredExp,
  loadPlayer,
  savePlayer,
} from "@/lib/levelSystem";
import styles from "./page.module.css";

const POINTS = { toku: 10, good: 6 } as const;
type TypeKind = keyof typeof POINTS;

function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  // getMonth → 0始まり
  // padStart → 2文字にして空いたら0をいれる
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function showStatus(player: any) {
  const nextReq = getRequiredExp(player.level);
  console.log("=== 現在のステータス ===");
  console.log(`Lv.${player.level}`);
  console.log(`Exp: ${player.exp}/${nextReq}`);
  console.log(`Total: ${player.totalExp}`);
  console.log("=========================");
}

// コンポーネント本体
export default function RecordPage() {
  // フォーム状態
  const [type, setType] = useState<TypeKind>("toku");
  const [dateStr, setDateStr] = useState(todayISO());
  const [category, setCategory] = useState(""); // 大カテゴリ
  const [sub, setSub] = useState(""); // サブカテゴリ
  const [memo, setMemo] = useState("");
  const [content, setContent] = useState<string>(""); // 任意メモ
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // ログイン処理
  const { user, loading } = useAuthGuard({ requireLogin: true });
  // 将来：type が "good" のときは GOOD_TREE に入れ替える想定
  const tree = useMemo(
    () => (type === "toku" ? TOKU_CATEGORIES : GOOD_CATEGORIES),
    [type],
  );
  if (loading) return <LoadingMessage />;

  const canSubmit = !!(type && dateStr && (sub || category));

  const handlePick = (cat: string, sublabel: string) => {
    setCategory(cat);
    setSub(sublabel);
  };

  const handleSubmit = async () => {
    if (!canSubmit || saving) return;
    setSaving(true);
    setMsg("");
    try {
      const occurred = new Date(dateStr);
      const currentUser = auth.currentUser || user;
      if (!user) {
        setMsg("ログイン状態を確認してください");
        setSaving(false);
        return;
      }
      const userRecordsRef = collection(db, "users", user.uid, "records");
      await addDoc(userRecordsRef, {
        type,
        category,
        subcategory: sub || null,
        content: memo.trim() || null,
        occurredOn: occurred,
        points: POINTS[type],
        createdAt: serverTimestamp(),
      });
      let player = loadPlayer(); // ローカルデータ読み込み
      player = addExp(player, category); // カテゴリに応じたXP加算
      player = completeDailyChallenge(player, "record"); // デイリーチャレンジ更新
      savePlayer(player); // ローカルへ保存
      showStatus(player); // コンソール出力

      setMsg(`保存しました！ +${category}で経験値獲得`);
      setMemo("");
      setSub("");
    } catch (e) {
      console.error(e);
      setMsg("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* ヘッダ */}
      <header className={styles.header}>
        {/* <h1 className={styles.title}>{type === "toku" ? "とくつみ記録" : "いいこと記録"}</h1> */}
        <div className={styles.typeSwitch}>
          <button
            type="button"
            className={`${styles.typeBtn} ${type === "toku" ? styles.typeActive : ""}`}
            onClick={() => setType("toku")}
          >
            🌿 徳
          </button>
          <button
            type="button"
            className={`${styles.typeBtn} ${type === "good" ? styles.typeActive : ""}`}
            onClick={() => setType("good")}
          >
            ✨ いいこと
          </button>
        </div>
      </header>

      {/* 日付 */}
      <section className={styles.panel}>
        <label className={styles.label} htmlFor="date-input">
          日付
        </label>
        <div className={styles.row}>
          <input
            id="date-input"
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className={styles.input}
          />
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => setDateStr(todayISO())}
          >
            今
          </button>
        </div>
      </section>

      {/* カテゴリ → 横スワイプでサブ選択 */}
      <section className={styles.panel}>
        <CategorySwiper data={tree as any} onPick={handlePick} />
        <p className={styles.hint}>
          選択：{category || "—"} {sub ? `> ${sub}` : ""}
        </p>
      </section>

      {/* 詳細メモ（任意） */}
      <section className={styles.panel}>
        <label className={styles.label} htmlFor="memo-input">
          詳細（任意）
        </label>
        <textarea
          id="memo-input"
          rows={3}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className={styles.textarea}
          placeholder="自由入力"
        />
      </section>

      {/* アクション */}
      <section className={styles.actionRow}>
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
      <Footer />
    </div>
  );
}
