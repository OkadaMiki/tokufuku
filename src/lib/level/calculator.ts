import { GOOD_CATEGORIES, TOKU_CATEGORIES } from "@/constants/categories";
import type { PlayerData } from "@/lib/playerData";
import { getBusinessDate } from "./dateUtils";
import { savePlayer } from "./storage";

// 全カテゴリを統合
const allCategories = [...TOKU_CATEGORIES, ...GOOD_CATEGORIES];

// カテゴリ名から対応する経験値量を取得
export const getCategoryExp = (categoryName: string): number | null => {
  const found = allCategories.find((c) => c.label === categoryName);
  return found?.exp ?? null;
};

// 必要経験値計算式（レベルアップ必要量）
export const getRequiredExp = (level: number): number => {
  return 100 + level * 15;
};

// 経験値計算ロジック（共通化）
export const calculateExpUpdate = (player: PlayerData, gain: number) => {
  let newExp = player.exp + gain;
  const newTotal = player.totalExp + gain;
  let newLevel = player.level;

  while (newExp >= getRequiredExp(newLevel)) {
    newExp -= getRequiredExp(newLevel);
    newLevel++;
  }

  return {
    level: newLevel,
    exp: newExp,
    totalExp: newTotal,
  };
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

// 経験値加算＆レベルアップ判定（修正版）
export const addExp = (player: PlayerData, category: string): PlayerData => {
  let gain = getCategoryExp(category);

  if (gain == null) {
    console.warn(`⚠️ 未定義カテゴリ '${category}' です。XP加算をスキップ`);
    return player;
  }

  // 占いボーナス判定 (2倍)
  // 営業日が一致 かつ カテゴリラベルが一致
  const businessDate = getBusinessDate(new Date());

  // Debug log
  if (player.fortune) {
    console.log("🔮 Fortune Debug:", {
      currentDate: businessDate,
      fortuneDate: player.fortune.lastFortuneDate,
      fortuneCategory: player.fortune.categoryLabel,
      inputCategory: category,
      matchDate: player.fortune.lastFortuneDate === businessDate,
      matchCategory: player.fortune.categoryLabel === category,
    });
  }

  if (
    player.fortune &&
    player.fortune.lastFortuneDate === businessDate &&
    player.fortune.categoryLabel === category
  ) {
    gain *= 2;
    console.log(`🔮 Fortune Bonus Applied! (x2) -> +${gain}`);
  }

  const { level, exp, totalExp } = calculateExpUpdate(player, gain);

  console.log(
    `+${gain} XP (${category}) → Lv${level} (${exp}/${getRequiredExp(level)})`,
  );

  const updated: PlayerData = {
    ...player,
    level,
    exp,
    totalExp,
  };

  // 仮保存（後で Firestore 保存に置き換え）
  savePlayer(updated);

  return updated;
};
