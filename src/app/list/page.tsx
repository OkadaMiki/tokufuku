"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import Footer from "@/components/layout/FooterNav";
import LoadingMessage from "@/components/ui/LoadingMessage";
import BoxTabSelector from "@/components/ui/BoxTabSelector";
import { useHistoryList } from "@/hooks/list/useHistoryList";
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

  return (
    <div className={styles.page}>
      <div className={styles.headerContainer}>
        <div className={styles.titleRow}>
          <span className={styles.title}>うらない記録</span>
        </div>
        {/* Tabs */}
        <BoxTabSelector
          options={[
            { label: "徳", value: "toku" },
            { label: "占い", value: "fortune" },
            { label: "良いこと", value: "good" },
          ]}
          value={activeTab}
          onChange={(val) => setActiveTab(val as any)}
        />

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
