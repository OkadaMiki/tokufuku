"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Footer from "@/components/layout/FooterNav";

import LoadingMessage from "@/components/ui/LoadingMessage";
import { GOOD_CATEGORIES, TOKU_CATEGORIES, findLabelByKey } from "@/constants/categories";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { db } from "@/lib/firebase";
import styles from "./page.module.css";

type TabType = "toku" | "good" | "fortune";

type RecordItem = {
  id: string;
  type: "toku" | "good";
  category: string;
  subcategory?: string | null;
  content?: string | null;
  occurredOn: { seconds: number; nanoseconds: number };
  points: number;
  hasBonus?: boolean;
};

type FortuneItem = {
  id: string;
  result: string; // Label
  categoryKey: string;
  date: string; // YYYY-MM-DD
  tokuCount: number;
};

// Generate last 12 months for dropdown
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

export default function RecordListPage() {
  const router = useRouter();
  const { user, loading } = useAuthGuard({ requireLogin: true });
  
  const [activeTab, setActiveTab] = useState<TabType>("toku");
  // Default to current month
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
      setRecords([]);
      setFortunes([]);

      try {
        const [yearStr, monthStr] = selectedMonth.split("-");
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10);

        // Calculate start/end dates
        // Start: 1st of month 00:00:00
        const startDt = new Date(year, month - 1, 1, 0, 0, 0);
        // End: Last day of month 23:59:59.999
        const endDt = new Date(year, month, 0, 23, 59, 59, 999);

        if (activeTab === "fortune") {
          // Query Fortunes
          // Stores date as "YYYY-MM-DD" string
          const startStr = `${yearStr}-${monthStr}-01`;
          const endStr = `${yearStr}-${monthStr}-31`; // Loose upper bound covers full month
          
          const ref = collection(db, "users", user.uid, "fortunes");
          const q = query(
            ref,
            where("date", ">=", startStr),
            where("date", "<=", endStr),
            orderBy("date", "desc") // requires index if filtering by range? Often yes.
          );
          
          try {
             const snap = await getDocs(q);
             const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as FortuneItem[];
             setFortunes(data);
          } catch (err: any) {
             // Fallback if index missing or error
             console.error("Fortune fetch error (likely index missing):", err);
             // Try fetching simple list and client filtering if small? 
             // Or just log error (User might need to create index)
          }

        } else {
          // Query Records (toku / good)
          const ref = collection(db, "users", user.uid, "records");
          const startTs = Timestamp.fromDate(startDt);
          const endTs = Timestamp.fromDate(endDt);
          
          const q = query(
            ref,
            // where("type", "==", activeTab), // Removed to avoid composite index requirement
            where("occurredOn", ">=", startTs),
            where("occurredOn", "<=", endTs),
            orderBy("occurredOn", "desc")
          );

          try {
            const snap = await getDocs(q);
            const rawData = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as RecordItem[];
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

  if (loading) {
    return <LoadingMessage text="読み込み中..." />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerContainer}>
        <div className={styles.titleRow}>
           {/* Image shows a character/icon in header, but text title requests "Record List"? 
               Original code had "記録一覧". I'll keep title but maybe match image style later if requested.
               Image text says "うらない記録" (Fortune Record) but that is likely partial context. 
               Use "記録一覧" (Record List) as generic title or dynamic title?
               Let's keep generic for now.
           */}
           <span className={styles.title}>うらない記録</span> 
        </div>

        {/* Tabs */}
        <div className={styles.tabContainer}>
           <button 
             className={`${styles.tab} ${activeTab === 'toku' ? styles.activeTab : ''}`}
             onClick={() => setActiveTab('toku')}
           >
             徳
           </button>
           <button 
             className={`${styles.tab} ${activeTab === 'fortune' ? styles.activeTab : ''}`}
             onClick={() => setActiveTab('fortune')}
           >
             占い
           </button>
           <button 
             className={`${styles.tab} ${activeTab === 'good' ? styles.activeTab : ''}`}
             onClick={() => setActiveTab('good')}
           >
             良いこと
           </button>
        </div>

        {/* Filter */}
        <div className={styles.monthRow}>
           <select 
             className={styles.monthSelect}
             value={selectedMonth}
             onChange={(e) => setSelectedMonth(e.target.value)}
           >
             {monthOptions.map((opt) => (
               <option key={opt.val} value={opt.val}>
                 {opt.label}
               </option>
             ))}
           </select>
        </div>
      </div>
      
      {loadingData ? (
         <div className={styles.loading}>読み込み中...</div>
      ) : (
        <>
          {/* CONTENT AREA */}
          {activeTab === 'fortune' ? (
             fortunes.length === 0 ? (
               <p className={styles.empty}>この月の占い記録はありません。</p>
             ) : (
               fortunes.map((f) => (
                 <div key={f.id} className={styles.card}>
                   <div className={styles.cardHeader}>
                     <span className={styles.date}>{f.date.replace(/-/g, '年').replace(/$/, '日').replace(/年(\d+)年/, '年$1月')}</span>
                     {/* Formatter above is hacky, let's use standard JS for display */}
                     {/* Actually easier: f.date is YYYY-MM-DD. display: YYYY年M月D日 */}
                   </div>
                   <div className={styles.cardBody}>
                     <strong>{f.result}</strong>
                     <p className={styles.memo}>過去の徳積み: {f.tokuCount}回</p>
                   </div>
                   <div className={styles.actionRow}>
                   <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => handleDelete(f.id, true)}
                      >
                        削除
                      </button>
                   </div>
                 </div>
               ))
             )
          ) : (
             records.length === 0 ? (
               <p className={styles.empty}>この月の記録はありません。</p>
             ) : (
               records.map((r) => {
                 // Convert timestamp
                 const d = new Date(r.occurredOn.seconds * 1000);
                 const dateStr = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
                 const label = findLabelByKey(r.category, tree); // Resolve key to label

                 return (
                    <div key={r.id} className={styles.card}>
                      <div className={styles.cardHeader}>
                        <span className={styles.date}>{dateStr}</span>
                        {/* 
                        <span className={`${styles.typeBadge} ${r.type === 'toku' ? styles.typeToku : styles.typeGood}`}>
                          {r.type === 'toku' ? '徳' : '良いこと'}
                        </span>
                        Tabs already separate them, maybe badge is redundant? 
                        Keeping it minimal or removing. I'll remove it as tabs imply context.
                        */}
                      </div>
                      <div className={styles.cardBody}>
                        <strong>{label}</strong>
                        {r.subcategory && ` > ${findLabelByKey(r.subcategory, tree)}`}
                        {r.content && <p className={styles.memo}>{r.content}</p>}
                        {r.hasBonus && <span style={{fontSize:'12px', color:'#f59e0b'}}>★ 占いボーナス！</span>}
                      </div>
                      <div className={styles.actionRow}>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          onClick={() => handleDelete(r.id, false)}
                        >
                          削除
                        </button>
                      </div>
                    </div>
                 );
               })
             )
          )}
        </>
      )}

      <Footer />
    </div>
  );
}
