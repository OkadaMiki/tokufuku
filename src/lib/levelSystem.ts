// src/lib/levelSystem.ts
import { TOKU_TREE, GOOD_TREE } from "@/constants/categories";
import type { PlayerData } from "@/lib/playerData";

//  全カテゴリを統合 
const allCategories = [...TOKU_TREE, ...GOOD_TREE];

// カテゴリ名から対応する経験値量を取得
export const getCategoryExp = (categoryName: string): number | null => {
  const found = allCategories.find(c => c.key === categoryName);
  return found?.exp ?? null;
};

// 必要経験値計算式（レベルアップ必要量）
export const getRequiredExp = (level: number): number => {
  return 100 + level * 15;
};

// 経験値加算＆レベルアップ判定
export const addExp = (player: PlayerData, category: string): PlayerData => {
  const gain = getCategoryExp(category);

  if (gain == null) {
    console.warn(`⚠️ 未定義カテゴリ '${category}' です。XP加算をスキップ`);
    return player;
  }

  let newExp = player.exp + gain;
  let newTotal = player.totalExp + gain;
  let newLevel = player.level;

  const required = getRequiredExp(player.level);
  while (newExp >= required) {
    newExp -= required;
    newLevel++;
  }

  console.log(`+${gain} XP (${category}) → Lv${newLevel} (${newExp}/${getRequiredExp(newLevel)})`);

  const updated = {
    ...player,
    level: newLevel,
    exp: newExp,
    totalExp: newTotal,
  };

  // 仮保存（後でFirestore保存に置き換え）
  localStorage.setItem("player", JSON.stringify(updated));

  return updated;
};

// 保存されたプレイヤーデータを読み込み
export const loadPlayer = (): PlayerData => {
  if (typeof window === "undefined") return { level: 1, exp: 0, totalExp: 0 };
  const raw = localStorage.getItem("player");
  return raw ? JSON.parse(raw) : { level: 1, exp: 0, totalExp: 0 };
};

// プレイヤーデータを保存（加筆）
export const savePlayer = (player: PlayerData): void => {
  try {
    localStorage.setItem("player", JSON.stringify(player));
    console.log("✅ Player saved:", player);
  } catch (err) {
    console.error("❌ Failed to save player:", err);
  }
};

// 残り経験値
export const getRemainingExp = (player: PlayerData): number => {
  const required = getRequiredExp(player.level);
  return required - player.exp;
};

// 進捗率（バー用）
export const getExpRate = (player: PlayerData): number => {
  const required = getRequiredExp(player.level);
  return player.exp / required;
};
