import { useState, useMemo, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GOOD_CATEGORIES, TOKU_CATEGORIES } from "@/constants/categories";

export type TabType = "toku" | "good" | "fortune";

export type RecordItem = {
  id: string;
  type: "toku" | "good";
  category: string;
  subcategory?: string | null;
  content?: string | null;
  occurredOn: { seconds: number; nanoseconds: number };
  points: number;
  hasBonus?: boolean;
};

export type FortuneItem = {
  id: string;
  result: string; // Label
  categoryKey: string;
  date: string; // YYYY-MM-DD
  tokuCount: number;
};

function getMonthOptions() {
  const options = [];
  const d = new Date();
  d.setDate(1); // Avoid month rollover issues
  for (let i = 0; i < 13; i++) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const val = `${y}-${m}`;
    const label = `${y}年${d.getMonth() + 1}月`;
    options.push({ val, label });
    d.setMonth(d.getMonth() - 1);
  }
  return options;
}

export function useHistoryList(user: any) {
  const [activeTab, setActiveTab] = useState<TabType>("toku");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const [records, setRecords] = useState<RecordItem[]>([]);
  const [fortunes, setFortunes] = useState<FortuneItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const monthOptions = useMemo(() => getMonthOptions(), []);

  // Sync tree for label lookup
  const tree = useMemo(
    () => (activeTab === "good" ? GOOD_CATEGORIES : TOKU_CATEGORIES),
    [activeTab],
  );

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoadingData(true);
      const startTime = Date.now();
      setRecords([]);
      setFortunes([]);

      try {
        const [yearStr, monthStr] = selectedMonth.split("-");
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10);

        const startDt = new Date(year, month - 1, 1, 0, 0, 0);
        const endDt = new Date(year, month, 0, 23, 59, 59, 999);

        if (activeTab === "fortune") {
          const startStr = `${yearStr}-${monthStr}-01`;
          const endStr = `${yearStr}-${monthStr}-31`; // Loose upper bound

          const ref = collection(db, "users", user.uid, "fortunes");
          const q = query(
            ref,
            where("date", ">=", startStr),
            where("date", "<=", endStr),
            orderBy("date", "desc"),
          );

          try {
            const snap = await getDocs(q);
            const data = snap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            })) as FortuneItem[];
            setFortunes(data);
          } catch (err: any) {
            console.error("Fortune fetch error (likely index missing):", err);
          }
        } else {
          const ref = collection(db, "users", user.uid, "records");
          const startTs = Timestamp.fromDate(startDt);
          const endTs = Timestamp.fromDate(endDt);

          const q = query(
            ref,
            where("occurredOn", ">=", startTs),
            where("occurredOn", "<=", endTs),
            orderBy("occurredOn", "desc"),
          );

          try {
            const snap = await getDocs(q);
            const rawData = snap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            })) as RecordItem[];
            // Filter by type client-side
            const data = rawData.filter((r) => r.type === activeTab);
            setRecords(data);
          } catch (err) {
            console.error("Record fetch error:", err);
          }
        }
      } catch (e) {
        console.error("Error fetching data:", e);
      } finally {
        const elapsed = Date.now() - startTime;
        const minDuration = 1000;
        const remaining = Math.max(0, minDuration - elapsed);

        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user, activeTab, selectedMonth]);

  const handleDelete = async (id: string, isFortune: boolean) => {
    if (!user) return;
    if (!confirm("この記録を削除しますか？")) return;
    try {
      const collectionName = isFortune ? "fortunes" : "records";
      await deleteDoc(doc(db, "users", user.uid, collectionName, id));

      if (isFortune) {
        setFortunes((prev) => prev.filter((r) => r.id !== id));
      } else {
        setRecords((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (e) {
      console.error("削除エラー:", e);
    }
  };

  return {
    activeTab,
    setActiveTab,
    selectedMonth,
    setSelectedMonth,
    records,
    fortunes,
    loadingData,
    monthOptions,
    tree,
    handleDelete,
  };
}
