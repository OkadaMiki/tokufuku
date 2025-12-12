"use client";

import { useEffect, useState } from "react";
import Footer from "@/components/layout/FooterNav";
import LoadingMessage from "@/components/ui/LoadingMessage";
import { type Category, TOKU_CATEGORIES } from "@/constants/categories";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
  completeDailyChallenge,
  loadBuffer,
  loadPlayer,
  saveBuffer,
  savePlayer,
  savePlayerToFirestore,
} from "@/lib/level";
import { getBusinessDate } from "@/lib/level/dateUtils";
import type { PlayerData } from "@/lib/playerData";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function FortunePage() {
  const { user, loading } = useAuthGuard({ requireLogin: true });
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [fortuneCategory, setFortuneCategory] = useState<Category | null>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      if (!loading && user?.uid) {
        setIsDataLoading(true);
        
        // Firestoreとローカルストレージを同期
        const { syncPlayerData } = await import("@/lib/level");
        const p = await syncPlayerData(user.uid);
        
        setPlayer(p);

        const today = getBusinessDate(new Date());
        if (p.fortune && p.fortune.lastFortuneDate === today) {
          // Already drawn today
          const found = TOKU_CATEGORIES.find(
            (c) => c.key === p.fortune?.categoryKey,
          );
          if (found) {
            setFortuneCategory(found);
            setRevealed(true);
          }
        }
        
        setIsDataLoading(false);
      }
    };
    
    loadData();
  }, [loading, user]);

  const handleCardSelect = (cardIndex: number) => {
    if (revealed) return;
    setSelectedCard(cardIndex);
  };

  const handleConfirm = async () => {
    if (!player || revealed || selectedCard === null) return;

    // Filter out "Other" categories
    // Filter out "Other" categories
    const validCategories = TOKU_CATEGORIES.filter(
      (c) => !c.label.includes("その他") && !c.key.endsWith("other"),
    );

    const randomCat =
      validCategories[Math.floor(Math.random() * validCategories.length)];
    const today = getBusinessDate(new Date());

    const updatedPlayer: PlayerData = {
      ...player,
      fortune: {
        lastFortuneDate: today,
        categoryLabel: randomCat.label,
        categoryKey: randomCat.key,
      },
    };

    // ★ バッファ保存ロジック (Data B)
    // まだバッファがない場合のみ、現在の状態（経験値加算前）を保存する
    // これにより、Homeに戻ったときに「加算前 -> 加算後」のアニメーションが可能になる
    const existingBuffer = loadBuffer();
    if (!existingBuffer) {
      saveBuffer(updatedPlayer); // fortuneは含めるが、経験値加算前の状態
    }

    // Complete challenge (経験値加算)
    const finalPlayer = completeDailyChallenge(updatedPlayer, "uranai");
    
    // Firestoreへ保存を試みる
    if (user?.uid) {
      const saveSuccess = await savePlayerToFirestore(user.uid, finalPlayer);
      
      if (saveSuccess) {
        // Firestore保存成功時のみローカルに保存してUIを更新
        savePlayer(finalPlayer);
        setPlayer(finalPlayer);
        setFortuneCategory(randomCat);
        setRevealed(true);
      } else {
        // 保存失敗時はエラーを表示（UIは更新しない）
        console.error("⚠️ 占い結果の保存に失敗しました");
        alert("占い結果の保存に失敗しました。もう一度お試しください。");
      }
    } else {
      // ログインしていない場合（本来は起きないはず）
      console.error("⚠️ ユーザーがログインしていません");
    }
  };

  if (loading || isDataLoading || !player) return <LoadingMessage />;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>今日の運勢</h1>

      {!revealed ? (
        <>
          <div className={styles.cardContainer}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <button
                type="button"
                key={i}
                className={`${styles.card} ${selectedCard === i ? styles.selected : ""}`}
                onClick={() => handleCardSelect(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleCardSelect(i);
                }}
              >
                
              </button>
            ))}
          </div>
          {selectedCard !== null && (
            <button
              type="button"
              className={styles.confirmButton}
              onClick={handleConfirm}
            >
              これにする
            </button>
          )}
        </>
      ) : (
        <div className={styles.result}>
          <p className={styles.resultTitle}>今日のラッキーカテゴリ</p>
          <div className={styles.categoryName}>{fortuneCategory?.label}</div>
          <p className={styles.bonusText}>
            このカテゴリで記録すると経験値2倍！
          </p>
          <button
              type="button"
              className={styles.confirmButton}
              onClick={() => router.push("/record")}
            >
              いますぐ記録する
            </button><button
              type="button"
              className={styles.confirmButton}
              onClick={() => router.push("/")}
            >
              ホームに戻る
            </button>
        </div>
      )}

      <Footer />
    </div>
  );
}
