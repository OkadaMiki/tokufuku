"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Footer from "@/components/FooterNav";

import LoadingMessage from "@/components/LoadingMessage";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { db } from "@/lib/firebase";
import styles from "./page.module.css";

type RecordItem = {
  id: string;
  type: "toku" | "good";
  category: string;
  subcategory?: string | null;
  content?: string | null;
  occurredOn: { seconds: number; nanoseconds: number };
  points: number;
};

export default function RecordListPage() {
  const router = useRouter();
  const { user, loading } = useAuthGuard({ requireLogin: true });
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchRecords = async () => {
      try {
        const ref = collection(db, "users", user.uid, "records");
        const q = query(ref, orderBy("occurredOn", "desc"));
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => {
          const { id, ...rest } = d.data() as RecordItem;
          return { id: d.id, ...rest };
        });
        setRecords(data);
      } catch (e) {
        console.error("データ取得に失敗:", e);
      } finally {
        setLoadingData(false);
      }
    };
    fetchRecords();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!confirm("この記録を削除しますか？")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "records", id));
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error("削除エラー:", e);
    }
  };

  if (loading || loadingData) {
    return <LoadingMessage text="記録を読み込み中..." />;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>記録一覧</h1>
        <div className={styles.filterRow}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => router.push("/record")}
          >
            ＋ 新しい記録
          </button>
        </div>
      </header>

      {records.length === 0 ? (
        <p className={styles.empty}>まだ記録がありません。</p>
      ) : (
        records.map((r) => {
          const date = new Date(r.occurredOn.seconds * 1000);
          const dateStr = `${date.getFullYear()}-${String(
            date.getMonth() + 1,
          ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

          return (
            <div key={r.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.date}>{dateStr}</span>
                <span
                  className={`${styles.typeBadge} ${r.type === "toku" ? styles.typeToku : styles.typeGood
                    }`}
                >
                  {r.type === "toku" ? "🌿 徳" : "✨ いいこと"}
                </span>
              </div>

              <div className={styles.cardBody}>
                <strong>{r.category}</strong>
                {r.subcategory && ` > ${r.subcategory}`}
                {r.content && <p className={styles.memo}>{r.content}</p>}
              </div>

              <div className={styles.actionRow}>
                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  onClick={() => handleDelete(r.id)}
                >
                  削除
                </button>
              </div>
            </div>
          );
        })
      )}
      <Footer />
    </div>
  );
}
