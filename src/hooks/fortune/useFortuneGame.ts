import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getCountFromServer,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TOKU_CATEGORIES, type Category } from "@/constants/categories";
import {
  getBusinessDate,
  loadBuffer,
  saveBuffer,
  completeDailyChallenge,
  savePlayerToFirestore,
} from "@/lib/level";
import type { PlayerData } from "@/lib/playerData";

export const useFortuneGame = (user: any, loading: boolean) => {
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [fortuneCategory, setFortuneCategory] = useState<Category | null>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

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
    const validCategories = TOKU_CATEGORIES.filter(
      (c) => !c.label.includes("その他") && !c.key.endsWith("other"),
    );

    const randomCat =
      validCategories[Math.floor(Math.random() * validCategories.length)];
    const today = getBusinessDate(new Date());

    // Calculate toku count for this category
    let tokuCount = 0;
    if (user?.uid) {
      try {
        const recordsRef = collection(db, "users", user.uid, "records");
        // Note: We now save keys, so we query keys. Old records with labels will not be counted.
        const q2 = query(recordsRef, where("category", "==", randomCat.key));
        const snapshot = await getCountFromServer(q2);
        tokuCount = snapshot.data().count;
      } catch (e) {
        console.error("Failed to count toku records", e);
      }
    }

    // Save fortune history to separate 'fortunes' collection
    if (user?.uid) {
      try {
        const fortunesRef = collection(db, "users", user.uid, "fortunes");
        await addDoc(fortunesRef, {
          result: randomCat.label,
          categoryKey: randomCat.key,
          date: today,
          tokuCount: tokuCount,
          createdAt: serverTimestamp(),
        });
      } catch (e) {
        console.error("Failed to save fortune history", e);
      }
    }

    const updatedPlayer: PlayerData = {
      ...player,
      fortune: {
        lastFortuneDate: today,
        categoryLabel: randomCat.label,
        categoryKey: randomCat.key,
      },
    };

    // ★ バッファ保存ロジック (Data B)
    const existingBuffer = loadBuffer();
    if (!existingBuffer) {
      const bufferedPlayer: PlayerData = {
        ...updatedPlayer,
        dailyChallenge: {
          ...updatedPlayer.dailyChallenge,
          completed: {
            ...updatedPlayer.dailyChallenge?.completed,
            uranai: true,
          },
        },
      };
      saveBuffer(bufferedPlayer);
    }

    // Complete challenge (経験値加算)
    const finalPlayer = completeDailyChallenge(updatedPlayer, "uranai");

    // Firestoreへ保存を試みる
    if (user?.uid) {
      const saveSuccess = await savePlayerToFirestore(user.uid, finalPlayer);

      if (saveSuccess) {
        // Firestore保存成功時にUIを更新（ローカルキャッシュはsavePlayerToFirestore内で自動更新）
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

  return {
    player,
    revealed,
    fortuneCategory,
    selectedCard,
    isDataLoading,
    handleCardSelect,
    handleConfirm,
  };
};
