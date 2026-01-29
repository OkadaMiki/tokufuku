"use client";

import Image from "next/image";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Footer from "@/components/layout/FooterNav";
import LoadingMessage from "@/components/ui/LoadingMessage";
import { useHistoryList, type TabType } from "@/hooks/list/useHistoryList";
import HistoryList from "@/components/features/list/HistoryList";
import styles from "./page.module.css";

export default function RecordListPage() {
  const { user, loading } = useAuthGuard({ requireLogin: true });

  const {
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
  } = useHistoryList(user);

  if (loading) {
    return <LoadingMessage text="読み込み中..." />;
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: "toku", label: "徳" },
    { key: "fortune", label: "占い" },
    { key: "good", label: "良いこと" },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.headerContainer}>
        <div className={styles.headerContent}>
          <div className={styles.charIcon}>
             <Image 
               src="/assets/characters/baby/pink.svg" 
               alt="Character" 
               width={56} 
               height={56}
               className={styles.charImage} 
             />
          </div>
          <div className={styles.titleWrapper}>
            <Image
              src="/assets/list/title.png"
              alt="うらない記録"
              width={200}
              height={60}
              className={styles.titleImage}
              priority
            />
          </div>
        </div>

        {/* Custom Tabs */}
        <div className={styles.tabs}>
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              className={activeTab === t.key ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filter */}
        <div className={styles.filterRow}>
          <div className={styles.monthSelector}>
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
            <span className={styles.monthArrow}>▼</span>
          </div>
        </div>
      </div>

      <HistoryList
        activeTab={activeTab}
        records={records}
        fortunes={fortunes}
        loading={loadingData}
        tree={tree}
        onDelete={handleDelete}
      />

      <Footer />
    </div>
  );
}
