import { type PlayerData, validatePlayerData } from "@/lib/playerData";
import { shouldResetDailyChallenge } from "./dateUtils";

const LOCAL_CACHE_KEY = "player_cache";
const LOCAL_BUFFER_KEY = "player_buffer";

// ===== ローカルキャッシュ関連（表示高速化用、改ざん防止のため信頼しない） =====

// キャッシュを保存（表示高速化用、Firestore同期後に呼ばれる）
export const saveLocalCache = (player: PlayerData): void => {
  try {
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(player));
    console.log("📦 Local cache saved");
  } catch (err) {
    console.error("❌ Failed to save local cache:", err);
  }
};

// キャッシュを読み込み（Firestore同期前の高速表示用）
export const loadLocalCache = (): PlayerData | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!validatePlayerData(parsed)) return null;
    return parsed as PlayerData;
  } catch (_err) {
    return null;
  }
};

// キャッシュを削除（バッファは保持）
// ※アニメーション用バッファはアニメーション完了時にclearBuffer()で削除される
export const clearLocalCache = (): void => {
  try {
    localStorage.removeItem(LOCAL_CACHE_KEY);
    // 旧キー（player）も削除
    localStorage.removeItem("player");
    console.log("🗑️ Local cache cleared (buffer preserved)");
  } catch (err) {
    console.error("❌ Failed to clear local cache:", err);
  }
};

// 完全クリア（ログアウト時に使用）
export const clearAllLocalData = (): void => {
  try {
    localStorage.removeItem(LOCAL_CACHE_KEY);
    localStorage.removeItem(LOCAL_BUFFER_KEY);
    // 旧キーも削除
    localStorage.removeItem("player");
    localStorage.removeItem("player_buffer");
    console.log("🗑️ All local data cleared");
  } catch (err) {
    console.error("❌ Failed to clear all local data:", err);
  }
};

// ===== アニメーション用バッファ =====

// バッファ（アニメーション用）を保存
export const saveBuffer = (player: PlayerData): void => {
  try {
    localStorage.setItem(LOCAL_BUFFER_KEY, JSON.stringify(player));
  } catch (err) {
    console.error("❌ Failed to save buffer:", err);
  }
};

// バッファを読み込み
export const loadBuffer = (): PlayerData | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_BUFFER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PlayerData;
  } catch (_err) {
    return null;
  }
};

// バッファを削除（同期完了後など）
export const clearBuffer = (): void => {
  try {
    localStorage.removeItem(LOCAL_BUFFER_KEY);
  } catch (err) {
    console.error("Failed to clear buffer:", err);
  }
};

// ===== 後方互換性のためのエイリアス =====

// 旧API: savePlayer → saveLocalCache
export const savePlayer = saveLocalCache;

// 旧API: loadPlayer → getPlayerData（Firestoreから同期した最新データを返す）
// ただし、オフライン時や即座に表示が必要な場合はキャッシュを返す
export const loadPlayer = (): PlayerData => {
  const cached = loadLocalCache();
  if (cached) {
    // デイリーチャレンジのリセット判定
    if (shouldResetDailyChallenge(cached.lastLoginDate)) {
      console.log("🔄 日付が変わったため、デイリーチャレンジをリセットします");
      cached.dailyChallenge = { completed: {} };
    }
    cached.lastLoginDate = new Date().toISOString();
    return cached;
  }
  // キャッシュがない場合はデフォルト値を返す
  return { name: "プレイヤー", level: 1, exp: 0, totalExp: 0 };
};

// 旧API: clearPlayer → clearLocalCache
export const clearPlayer = clearLocalCache;

// ===== Firestore関連（信頼できるデータソース） =====

import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// undefinedのプロパティを除外するヘルパー関数
// Firestoreはundefined値をサポートしていないため、保存前に除外する必要がある
const removeUndefinedFields = <T extends object>(obj: T): Partial<T> => {
  const result: Partial<T> = {};
  for (const key of Object.keys(obj) as Array<keyof T>) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
};

// デフォルトのプレイヤーデータ
const getDefaultPlayerData = (): PlayerData => ({
  name: "プレイヤー",
  level: 1,
  exp: 0,
  totalExp: 0,
  dailyChallenge: { completed: {} },
  lastLoginDate: new Date().toISOString(),
});

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
      console.log("📭 Player data in Firestore is incomplete or invalid:", data);
      return null;
    }

    console.log("✅ Player loaded from Firestore:", data);
    return data as PlayerData;
  } catch (err) {
    console.error("❌ Failed to load player from Firestore:", err);
    return null;
  }
};

// Firestoreとローカルを同期（Firestoreを唯一の真実の源として使用）
// ※ローカルストレージの改ざんを防ぐため、常にFirestoreを優先
export const syncPlayerData = async (uid: string): Promise<PlayerData> => {
  try {
    const firestoreData = await loadPlayerFromFirestore(uid);
    
    if (firestoreData) {
      // Firestoreにデータがある場合、それを唯一の真実として使用
      // デイリーチャレンジのリセット判定
      let updatedData = { ...firestoreData };
      
      if (shouldResetDailyChallenge(firestoreData.lastLoginDate)) {
        console.log("🔄 日付が変わったため、デイリーチャレンジをリセットします");
        updatedData = {
          ...updatedData,
          dailyChallenge: { completed: {} },
          lastLoginDate: new Date().toISOString(),
        };
        // リセットした状態をFirestoreに保存
        await savePlayerToFirestore(uid, updatedData);
      } else {
        // 最終ログイン日時のみ更新
        updatedData.lastLoginDate = new Date().toISOString();
      }
      
      // ローカルキャッシュを更新（表示高速化用）
      saveLocalCache(updatedData);
      console.log("🔄 Synced: Firestore → Local cache");
      return updatedData;
    }
    
    // Firestoreにデータがない場合（新規ユーザー）
    // ※改ざん防止のため、ローカルデータは使用せず、デフォルト値で初期化
    console.log("🆕 New user detected, initializing with default data");
    const defaultData = getDefaultPlayerData();
    
    // Firestoreに初期データを保存
    await savePlayerToFirestore(uid, defaultData);
    // ローカルキャッシュも更新
    saveLocalCache(defaultData);
    
    return defaultData;
  } catch (err) {
    console.error("❌ Failed to sync player data:", err);
    // エラー時はローカルキャッシュを返すが、これは信頼できないので注意
    // オフライン使用を許可する場合のフォールバック
    const cached = loadLocalCache();
    if (cached) {
      console.warn("⚠️ Using local cache as fallback (may be stale or tampered)");
      return cached;
    }
    return getDefaultPlayerData();
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
      // undefinedのプロパティを除外してからFirestoreに保存
      const cleanedPlayer = removeUndefinedFields(player);
      await setDoc(userRef, cleanedPlayer, { merge: true });
      console.log(`✅ Player saved to Firestore (attempt ${attempt + 1})`);
      
      // Firestore保存成功時、ローカルキャッシュも更新
      saveLocalCache(player);
      
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
