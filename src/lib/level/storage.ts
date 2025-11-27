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
        fortune: parsed.fortune,
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

// バッファ（アニメーション用）を保存
export const saveBuffer = (player: PlayerData): void => {
  try {
    localStorage.setItem("player_buffer", JSON.stringify(player));
    // console.log("📦 Buffer saved:", player);
  } catch (err) {
    console.error("❌ Failed to save buffer:", err);
  }
};

// バッファを読み込み
export const loadBuffer = (): PlayerData | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("player_buffer");
    if (!raw) return null;
    return JSON.parse(raw) as PlayerData;
  } catch (err) {
    return null;
  }
};

// バッファを削除（同期完了後など）
export const clearBuffer = (): void => {
  try {
    localStorage.removeItem("player_buffer");
  } catch (err) {
    console.error("Failed to clear buffer:", err);
  }
};

import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Firestoreにプレイヤーデータを保存 (Data A)
export const savePlayerToFirestore = async (uid: string, player: PlayerData): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    // 必要なデータだけ抽出して保存（またはそのまま保存）
    // ここでは player オブジェクト全体をマージ保存します
    await setDoc(userRef, { ...player }, { merge: true });
    // console.log("🔥 Player saved to Firestore:", player);
  } catch (err) {
    console.error("❌ Failed to save player to Firestore:", err);
  }
};
