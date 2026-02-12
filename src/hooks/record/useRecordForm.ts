import { useState, useMemo } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  addExp,
  completeDailyChallenge,
  getRequiredExp,
  loadBuffer,
  loadPlayerFromFirestore,
  saveBuffer,
  savePlayerToFirestore,
  getBusinessDate,
} from "@/lib/level";
import { GOOD_CATEGORIES, TOKU_CATEGORIES } from "@/constants/categories";

const POINTS = {
  toku: 10,
  good: 6,
} as const;

export type TypeKind = keyof typeof POINTS;

function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function showStatus(player: any) {
  const nextReq = getRequiredExp(player.level);
  console.log("=== 現在のステータス ===");
  console.log(`Lv.${player.level}`);
  console.log(`Exp: ${player.exp}/${nextReq}`);
  console.log(`Total: ${player.totalExp}`);
  console.log("=========================");
}

export type SubmitResult =
  | {
    ok: true;
    message: string;
  }
  | {
    ok: false;
    message: string;
  };

export function useRecordForm(user: any) {
  const [type, setType] = useState<TypeKind>("toku");
  const [dateStr, setDateStr] = useState(todayISO());
  const [category, setCategory] = useState("");
  const [sub, setSub] = useState("");
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const tree = useMemo(() => {
    return type === "toku" ? TOKU_CATEGORIES : GOOD_CATEGORIES;
  }, [type]);

  const canSubmit = !!(type && dateStr && (sub || category));

  const handlePick = (catKey: string, subKey: string) => {
    setCategory(catKey);
    setSub(subKey);
  };

  const handleSetToday = () => {
    setDateStr(todayISO());
  };

  const handleSubmit = async (): Promise<SubmitResult> => {
    if (!canSubmit) {
      return {
        ok: false,
        message: "カテゴリを選んでください。",
      };
    }

    if (!user?.uid) {
      return {
        ok: false,
        message: "ログイン状態を確認してください。",
      };
    }

    setSaving(true);
    setMsg("");

    try {
      const occurred = new Date(dateStr);

      // Firestoreから最新のプレイヤーデータを取得（改ざん防止）
      let player = await loadPlayerFromFirestore(user.uid);
      if (!player) {
        player = {
          name: "プレイヤー",
          level: 1,
          exp: 0,
          totalExp: 0,
        };
      }

      const businessDate = getBusinessDate(new Date());

      const isBonus =
        player.fortune &&
        player.fortune.lastFortuneDate === businessDate &&
        (player.fortune.categoryKey === category ||
          player.fortune.categoryLabel === category);

      // レコード保存
      const userRecordsRef = collection(db, "users", user.uid, "records");
      await addDoc(userRecordsRef, {
        type,
        category,
        subcategory: sub || null,
        content: memo.trim() || null,
        occurredOn: occurred,
        points: POINTS[type],
        hasBonus: !!isBonus,
        createdAt: serverTimestamp(),
      });

      // バッファ（経験値加算前）を保存
      const existingBuffer = loadBuffer();
      if (!existingBuffer) {
        saveBuffer(player);
      }

      // 経験値・デイリーチャレンジ更新
      player = addExp(player, category);
      player = completeDailyChallenge(player, "record");

      // プレイヤーデータ保存
      const saveSuccess = await savePlayerToFirestore(user.uid, player);

      if (!saveSuccess) {
        setMsg("保存に失敗しました。もう一度お試しください。");
        return {
          ok: false,
          message: "保存に失敗しました。もう一度お試しください。",
        };
      }

      showStatus(player);

      setMsg(`保存しました！ +${category}で経験値獲得`);
      setMemo("");
      setSub("");
      setCategory("");

      return {
        ok: true,
        message: "良いことが起こりますように",
      };
    } catch (e) {
      console.error(e);

      setMsg("保存に失敗しました。通信環境を確認してもう一度お試しください。");

      return {
        ok: false,
        message: "保存に失敗しました。通信環境を確認してもう一度お試しください。",
      };
    } finally {
      setSaving(false);
    }
  };

  return {
    type,
    setType,
    dateStr,
    setDateStr,
    category,
    sub,
    memo,
    setMemo,
    saving,
    msg,
    tree,
    canSubmit,
    handlePick,
    handleSetToday,
    handleSubmit,
  };
}
