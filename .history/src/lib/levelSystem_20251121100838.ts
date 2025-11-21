// src/lib/levelSystem.ts
import { TOKU_TREE, GOOD_TREE } from "@/constants/categories";
import type { PlayerData } from "@/lib/playerData";

// 全カテゴリを統合
const allCategories = [...TOKU_TREE, ...GOOD_TREE];

// カテゴリ名から対応する経験値量を取得
export const getCategoryExp = (categoryName: string): number | null => {
  const found = allCategories.find((c) => c.key === categoryName);
  return found?.exp ?? null;
};

// 必要経験値計算式（レベルアップ必要量）
export const getRequiredExp = (level: number): number => {
  return 100 + level * 15;
};

// 経験値加算＆レベルアップ判定（修正版）
export const addExp = (player: PlayerData, category: string): PlayerData => {
  const gain = getCategoryExp(category);

  if (gain == null) {
    console.warn(`⚠️ 未定義カテゴリ '${category}' です。XP加算をスキップ`);
    return player;
  }

  let newExp = player.exp + gain;
  let newTotal = player.totalExp + gain;
  let newLevel = player.level;

  // ループ内で required を毎回再評価する（newLevel に合わせる）
  while (newExp >= getRequiredExp(newLevel)) {
    newExp -= getRequiredExp(newLevel);
    newLevel++;
  }

  console.log(
    `+${gain} XP (${category}) → Lv${newLevel} (${newExp}/${getRequiredExp(newLevel)})`
  );

  const updated: PlayerData = {
    ...player,
    level: newLevel,
    exp: newExp,
    totalExp: newTotal,
  };

  // 仮保存（後で Firestore 保存に置き換え）
  try {
    localStorage.setItem("player", JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to write player to localStorage:", e);
  }

  return updated;
};

// 保存されたプレイヤーデータを読み込み（default に name を含める）
export const loadPlayer = (): PlayerData => {
  if (typeof window === "undefined") {
    return { name: "プレイヤー", level: 1, exp: 0, totalExp: 0 };
  }
  try {
    const raw = localStorage.getItem("player");
    if (!raw) return { name: "プレイヤー", level: 1, exp: 0, totalExp: 0 };
    const parsed = JSON.parse(raw);
    // 最低限の型安全チェックとデフォルトフォールバック
    return {
      name: typeof parsed.name === "string" ? parsed.name : "プレイヤー",
      level: typeof parsed.level === "number" ? parsed.level : 1,
      exp: typeof parsed.exp === "number" ? parsed.exp : 0,
      totalExp: typeof parsed.totalExp === "number" ? parsed.totalExp : 0,
    };
  } catch (err) {
    console.error("Failed to load player from localStorage:", err);
    return { name: "プレイヤー", level: 1, exp: 0, totalExp: 0 };
  }
};

// プレイヤーデータを保存
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
  return Math.max(0, required - player.exp);
};

// 進捗率（バー用） 0〜1 を返す（安全）
export const getExpRate = (player: PlayerData): number => {
  const required = getRequiredExp(player.level);
  if (required <= 0) return 0;
  return Math.max(0, Math.min(1, player.exp / required));
};
