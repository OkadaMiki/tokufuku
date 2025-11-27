"use client";

import { useEffect, useState } from "react";
import { GOOD_CATEGORIES, TOKU_CATEGORIES, Category } from "@/constants/categories";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
  completeDailyChallenge,
  loadPlayer,
  savePlayer,
  savePlayerToFirestore,
} from "@/lib/levelSystem";
import { getBusinessDate } from "@/lib/level/dateUtils";
import { PlayerData } from "@/lib/playerData";
import { auth } from "@/lib/firebase";
import Footer from "@/components/FooterNav";
import LoadingMessage from "@/components/LoadingMessage";
import styles from "./page.module.css";

export default function FortunePage() {
  const { user, loading } = useAuthGuard({ requireLogin: true });
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [fortuneCategory, setFortuneCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (!loading) {
      const p = loadPlayer();
      setPlayer(p);

      const today = getBusinessDate(new Date());
      if (p.fortune && p.fortune.lastFortuneDate === today) {
        // Already drawn today
        const found = TOKU_CATEGORIES.find((c) => c.key === p.fortune?.categoryKey);
        if (found) {
          setFortuneCategory(found);
          setRevealed(true);
        }
      }
    }
  }, [loading]);

  const handleDraw = async () => {
    if (!player || revealed) return;

    // Filter out "Other" categories
    // Filter out "Other" categories
    const validCategories = TOKU_CATEGORIES.filter(
      (c) => !c.label.includes("その他") && !c.key.endsWith("other")
    );

    const randomCat = validCategories[Math.floor(Math.random() * validCategories.length)];
    const today = getBusinessDate(new Date());

    const updatedPlayer: PlayerData = {
      ...player,
      fortune: {
        lastFortuneDate: today,
        categoryLabel: randomCat.label,
        categoryKey: randomCat.key,
      },
    };

    // Save and complete challenge
    const finalPlayer = completeDailyChallenge(updatedPlayer, "uranai");
    savePlayer(finalPlayer);
    if (user?.uid) {
      await savePlayerToFirestore(user.uid, finalPlayer);
    }

    setPlayer(finalPlayer);
    setFortuneCategory(randomCat);
    setRevealed(true);
  };

  if (loading || !player) return <LoadingMessage />;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>今日の運勢</h1>

      {!revealed ? (
        <div className={styles.cardContainer}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.card} onClick={handleDraw}>
              ?
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.result}>
          <p className={styles.resultTitle}>今日のラッキーカテゴリ</p>
          <div className={styles.categoryName}>{fortuneCategory?.label}</div>
          <p className={styles.bonusText}>このカテゴリで記録すると経験値2倍！</p>
        </div>
      )}

      <Footer />
    </div>
  );
}
