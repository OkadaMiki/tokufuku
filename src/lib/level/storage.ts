import type { PlayerData } from "@/lib/playerData";
import { shouldResetDailyChallenge } from "./dateUtils";

// プレイヤーデータを保存
export const savePlayer = (player: PlayerData): void => {
  try {
    localStorage.setItem("player", JSON.stringify(player));
    console.log("✅ Player saved:", player);
  } catch (err) {
    console.error("❌ Failed to save player:", err);
  }
};

// 保存されたプレイヤーデータを読み込み（default に name を含める）
export const loadPlayer = (): PlayerData => {
  if (typeof window === "undefined") {
    return { name: "プレイヤー", level: 1, exp: 0, totalExp: 0 };
  }
  try {
    const raw = localStorage.getItem("player");
    let player: PlayerData;

    if (!raw) {
      player = { name: "プレイヤー", level: 1, exp: 0, totalExp: 0 };
    } else {
      const parsed = JSON.parse(raw);
      player = {
        name: typeof parsed.name === "string" ? parsed.name : "プレイヤー",
        level: typeof parsed.level === "number" ? parsed.level : 1,
        exp: typeof parsed.exp === "number" ? parsed.exp : 0,
        totalExp: typeof parsed.totalExp === "number" ? parsed.totalExp : 0,
        dailyChallenge: parsed.dailyChallenge || { completed: {} },
        lastLoginDate: parsed.lastLoginDate,
      };
    }

    if (shouldResetDailyChallenge(player.lastLoginDate)) {
      console.log("🔄 日付が変わったため、デイリーチャレンジをリセットします");
      player.dailyChallenge = { completed: {} };
    }

    // 最終ログイン日時を更新して保存
    player.lastLoginDate = new Date().toISOString();
    savePlayer(player);

    return player;
  } catch (err) {
    console.error("Failed to load player from localStorage:", err);
    return { name: "プレイヤー", level: 1, exp: 0, totalExp: 0 };
  }
};
