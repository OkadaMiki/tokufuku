import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { loadPlayerFromFirestore, saveLocalCache } from "./storage";
import { type PlayerData } from "@/lib/playerData";
import { getRequiredExp } from "./calculator";

// Helper to calculate total exp for a given level and current exp
const calculateTotalExp = (level: number, currentExp: number): number => {
  let total = 0;
  for (let l = 1; l < level; l++) {
    total += getRequiredExp(l);
  }
  total += currentExp;
  return total;
};

// デバッグ用：プレイヤーの進捗を指定した値にリセットする
export const resetPlayerProgress = async (
  uid: string,
  targetLevel: number,
  targetExp: number,
  resetFortune = false
): Promise<boolean> => {
  try {
    const currentData = await loadPlayerFromFirestore(uid);
    
    if (!currentData) {
      console.error("No player data found to reset");
      return false;
    }

    const newTotalExp = calculateTotalExp(targetLevel, targetExp);

    const newData: PlayerData = {
      ...currentData,
      level: targetLevel,
      exp: targetExp,
      totalExp: newTotalExp,
    };

    if (resetFortune) {
      // fortuneプロパティを削除（undefinedにする）
      delete newData.fortune;
      
      // デイリーチャレンジのuranaiフラグも削除
      if (newData.dailyChallenge?.completed?.uranai) {
        const { uranai, ...others } = newData.dailyChallenge.completed;
        newData.dailyChallenge.completed = others;
      }
    }

    // Firestoreのデータ型制約（undefined不可）のため、undefinedのフィールドを削除したオブジェクトを作る
    const cleanData = JSON.parse(JSON.stringify(newData));
    
    // 確実にfortuneが消えているか確認
    if ('fortune' in cleanData) {
      console.warn("⚠️ fortune field still exists in cleanData, forcing removal");
      delete cleanData.fortune;
    }

    // savePlayerToFirestoreはmerge:trueなのでフィールド削除ができない。
    // そのためここでは直接setDocを使って上書き保存（merge:false）する。
    const userRef = doc(db, "users", uid);
    
    console.log("Saving reset data to Firestore:", { 
      level: cleanData.level, 
      exp: cleanData.exp,
      hasFortune: !!cleanData.fortune,
      hasUranaiChallenge: !!cleanData.dailyChallenge?.completed?.uranai
    });

    await setDoc(userRef, cleanData); // Overwrite
    
    // ローカルキャッシュも更新
    saveLocalCache(newData);

    console.log(`✅ Player progress reset to Lv${targetLevel} Exp${targetExp}`);
    return true;
  } catch (e) {
    console.error("Failed to reset player progress", e);
    return false;
  }
};
