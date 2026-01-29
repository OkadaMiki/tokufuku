"use client";

import { useRouter } from "next/navigation";
import Footer from "@/components/layout/FooterNav";
import LoadingMessage from "@/components/ui/LoadingMessage";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useFortuneGame } from "@/hooks/fortune/useFortuneGame";
import FortuneCardSelector from "@/components/features/fortune/FortuneCardSelector";
import FortuneResult from "@/components/features/fortune/FortuneResult";

import styles from "./page.module.css";

export default function FortunePage() {
  const { user, loading } = useAuthGuard({ requireLogin: true });
  const router = useRouter();

  const {
    player,
    revealed,
    fortuneCategory,
    selectedCard,
    isDataLoading,
    handleCardSelect,
    handleConfirm,
  } = useFortuneGame(user, loading);

  if (loading || isDataLoading || !player) return <LoadingMessage />;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>今日の運勢</h1>

      {!revealed ? (
        <FortuneCardSelector
          selectedCard={selectedCard}
          onSelect={handleCardSelect}
          onConfirm={handleConfirm}
        />
      ) : (
        <FortuneResult
          categoryLabel={fortuneCategory?.label}
          onRecord={() => router.push("/record")}
          onHome={() => router.push("/home")}
        />
      )}

      <Footer />
    </div>
  );
}
