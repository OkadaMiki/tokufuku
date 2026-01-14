"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import CategorySwiper from "@/components/features/record/CategorySwiper";
import Footer from "@/components/layout/FooterNav";
import LoadingMessage from "@/components/ui/LoadingMessage";
import BoxTabSelector from "@/components/ui/BoxTabSelector";
import { GOOD_CATEGORIES, TOKU_CATEGORIES } from "@/constants/categories";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { auth, db } from "@/lib/firebase";
import {
  addExp,
  completeDailyChallenge,
  getRequiredExp,
  loadBuffer,
  loadPlayer,
  saveBuffer,
  savePlayer,
  savePlayerToFirestore,
  getBusinessDate,
} from "@/lib/level";
import styles from "./page.module.css";
import Image from "next/image";

const POINTS = { toku: 10, good: 6 } as const;
type TypeKind = keyof typeof POINTS;

// Helper to find label by key
import { type Category, type CategoryChild, findLabelByKey } from "@/constants/categories";

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
  // const [content, setContent] = useState<string>(""); // 任意メモ
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(true);

  // ログイン処理
  const { user, loading } = useAuthGuard({ requireLogin: true });
  // 将来：type が "good" のときは GOOD_TREE に入れ替える想定
  const tree = useMemo(
    () => (type === "toku" ? TOKU_CATEGORIES : GOOD_CATEGORIES),
    [type],
  );
  // 「その他」選択時にここへフォーカス
  const memoRef = useRef<HTMLTextAreaElement | null>(null);

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

  if (loading || isDataLoading) return <LoadingMessage />;

  const canSubmit = !!(type && dateStr && (sub || category));

  const handlePick = (catKey: string, subKey: string) => {
    setCategory(catKey);
    setSub(subKey);
  };

  const handleSubmit = async () => {
    if (!canSubmit || saving) return;
    setSaving(true);
    setMsg("");
    try {
      const occurred = new Date(dateStr);
      // const currentUser = auth.currentUser || user;
      if (!user) {
        setMsg("ログイン状態を確認してください");
        setSaving(false);
        return;
      }

      // レコード保存成功後、現在のプレイヤーデータを取得 -> 保存前に移動してボーナス判定に使う
      let player = loadPlayer(); // ローカルデータ読み込み

      // 占いボーナス判定
      // 営業日が一致 かつ カテゴリラベルが一致
      const businessDate = getBusinessDate(new Date()); // Current real-time business date
      // Note: If user inputs a past date, logic might need adjustment if we only want bonus for "doing it today". 
      // Current addExp logic uses `new Date()` so we match that.

      const isBonus =
        player.fortune &&
        player.fortune.lastFortuneDate === businessDate &&
        (player.fortune.categoryKey === category || player.fortune.categoryLabel === category);

      // まずFirestoreにレコードを保存
      const userRecordsRef = collection(db, "users", user.uid, "records");
      await addDoc(userRecordsRef, {
        type,
        category,
        subcategory: sub || null,
        content: memo.trim() || null,
        occurredOn: occurred,
        points: POINTS[type],
        hasBonus: !!isBonus,
        createdAt: serverTimestamp(),
      });

      const originalPlayer = { ...player }; // 元のデータを保存（ロールバック用）

      // ★ バッファ保存ロジック (Data B)
      // まだバッファがない場合のみ、現在の状態（加算前）を保存する
      // これにより、Homeに戻ったときに「加算前 -> 加算後」のアニメーションが可能になる
      const existingBuffer = loadBuffer();
      if (!existingBuffer) {
        saveBuffer(player);
      }

      // EXP加算とデイリーチャレンジ更新
      player = addExp(player, category); // カテゴリに応じたXP加算
      player = completeDailyChallenge(player, "record"); // デイリーチャレンジ更新

      // Firestoreへ保存を試みる (Data A)
      const saveSuccess = await savePlayerToFirestore(user.uid, player);

      if (saveSuccess) {
        // Firestore保存成功時のみローカルに保存
        savePlayer(player); // ローカルへ保存 (Data A)
        showStatus(player); // コンソール出力
        setMsg(`保存しました！ +${category}で経験値獲得`);
        setMemo("");
        setSub("");
      } else {
        // Firestore保存失敗時はロールバック
        console.error("⚠️ Firestore保存失敗のため、ローカルデータは更新されませんでした");
        setMsg("保存に失敗しました。もう一度お試しください。");
      }
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
        <div className={styles.head}>
          <div className={styles.pageName}>
            <Image src={"/assets/headers/recordh1.svg"} alt={"記録画面"} width={168} height={72} />
          </div>
        </div>
        <BoxTabSelector
          options={[
            { label: "🌿 徳", value: "toku" },
            { label: "✨ いいこと", value: "good" },
          ]}
          value={type}
          onChange={(val) => setType(val as TypeKind)}
          className={styles.fullWidthTab}
        />
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
        <CategorySwiper
          parents={tree as any}
          onPick={handlePick}
          memoRef={memoRef}
        />
        <p className={styles.hint}>
          選択中：{category ? findLabelByKey(category, tree) : "—"} {sub ? `> ${findLabelByKey(sub, tree)}` : ""}
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
          ref={memoRef}
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
