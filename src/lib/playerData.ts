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
