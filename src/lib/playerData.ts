export type ChallengeId = "feed" | "uranai" | "record";

export type DailyChallengeState = {
  completed: Partial<Record<ChallengeId, boolean>>;
};

// プレイヤー情報構造
export type PlayerData = {
  name: string;
  exp: number; // 現在レベル内の経験値
  level: number;
  totalExp: number; // 総経験値
  dailyChallenge?: DailyChallengeState; // まいにちチャレンジ状態
  lastLoginDate?: string; // 最終ログイン日時 (ISO string)
  fortune?: FortuneState;
};

export type FortuneState = {
  lastFortuneDate: string; // 営業日基準 (e.g. "Mon Nov 21 2025")
  categoryLabel: string;
  categoryKey: string;
};

export function validatePlayerData(data: any): data is PlayerData {
  if (typeof data !== "object" || data === null) return false;

  // 必須プロパティの型チェック
  if (typeof data.name !== "string") return false;
  if (typeof data.level !== "number" || data.level < 1) return false;
  if (typeof data.exp !== "number" || data.exp < 0) return false;
  if (typeof data.totalExp !== "number" || data.totalExp < 0) return false;

  // オプショナルプロパティのチェック (存在する場合のみ)
  if (
    data.lastLoginDate !== undefined &&
    typeof data.lastLoginDate !== "string"
  ) {
    return false;
  }

  if (data.dailyChallenge !== undefined) {
    if (
      typeof data.dailyChallenge !== "object" ||
      data.dailyChallenge === null ||
      typeof data.dailyChallenge.completed !== "object"
    ) {
      return false;
    }
  }

  if (data.fortune !== undefined) {
    if (
      typeof data.fortune !== "object" ||
      data.fortune === null ||
      typeof data.fortune.lastFortuneDate !== "string" ||
      typeof data.fortune.categoryLabel !== "string" ||
      typeof data.fortune.categoryKey !== "string"
    ) {
      return false;
    }
  }

  return true;
}
