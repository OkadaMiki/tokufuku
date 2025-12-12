import { type PlayerData, validatePlayerData } from "@/lib/playerData";
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

// プレイヤーデータを削除 (ログアウト時や再同期前など)
export const clearPlayer = (): void => {
  try {
    localStorage.removeItem("player");
    localStorage.removeItem("player_buffer"); // バッファも削除
    console.log("🗑️ Player data cleared from localStorage");
  } catch (err) {
    console.error("❌ Failed to clear player data:", err);
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
  } catch (_err) {
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

import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Firestoreからプレイヤーデータを読み込む
export const loadPlayerFromFirestore = async (
  uid: string,
): Promise<PlayerData | null> => {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log("📭 No player data found in Firestore");
      return null;
    }

    const data = userDoc.data();
    if (!validatePlayerData(data)) {
      console.log("📭 Player data in Firestore is incomplete or invalid, will use local data:", data);
      return null;
    }

    console.log("✅ Player loaded from Firestore:", data);
    return data as PlayerData;
  } catch (err) {
    console.error("❌ Failed to load player from Firestore:", err);
    return null;
  }
};

// Firestoreとローカルを同期（Firestoreを優先）
export const syncPlayerData = async (uid: string): Promise<PlayerData> => {
  try {
    const firestoreData = await loadPlayerFromFirestore(uid);
    
    if (firestoreData) {
      // Firestoreにデータがある場合はそれを使う
      savePlayer(firestoreData);
      console.log("🔄 Synced local storage with Firestore data");
      return firestoreData;
    }
    
    // Firestoreにデータがない場合はローカルを使う
    const localData = loadPlayer();
    // ローカルデータをFirestoreに保存
    await savePlayerToFirestore(uid, localData);
    console.log("⬆️ Uploaded local data to Firestore");
    return localData;
  } catch (err) {
    console.error("❌ Failed to sync player data:", err);
    // フォールバック：ローカルデータを返す
    return loadPlayer();
  }
};

// Firestoreにプレイヤーデータを保存 (Data A)
// リトライロジック付き
export const savePlayerToFirestore = async (
  uid: string,
  player: PlayerData,
  retries = 3,
): Promise<boolean> => {
  if (!validatePlayerData(player)) {
    console.error("❌ Invalid player data, skipping Firestore save:", player);
    return false;
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, { ...player }, { merge: true });
      console.log(`✅ Player saved to Firestore (attempt ${attempt + 1})`);
      return true;
    } catch (err) {
      console.error(`❌ Failed to save player to Firestore (attempt ${attempt + 1}):`, err);
      
      if (attempt < retries - 1) {
        // 指数バックオフで待機
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  console.error("❌ All retry attempts failed for Firestore save");
  return false;
};
