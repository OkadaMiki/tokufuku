import { useEffect, useRef, useState } from "react";
import {
  clearBuffer,
  getRequiredExp,
  loadBuffer,
} from "@/lib/level";
import type { PlayerData } from "@/lib/playerData";

export function useHomeAnimation(user: any, loading: boolean) {
  // 表示用のプレイヤーデータ（アニメーションで変化する）
  const [displayPlayer, setDisplayPlayer] = useState<PlayerData | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isEvolving, setIsEvolving] = useState(false);
  const [isLevelingUp, setIsLevelingUp] = useState(false);

  // アニメーション制御用
  const requestRef = useRef<number>(null);

  useEffect(() => {
    const loadAndAnimate = async () => {
      if (loading || !user?.uid) return;

      setIsDataLoading(true);

      // Firestoreとローカルストレージを同期（Firestoreが唯一の真実の源）
      const { syncPlayerData } = await import("@/lib/level");
      const realPlayer = await syncPlayerData(user.uid);

      // アニメーション用バッファを取得
      const bufferPlayer = loadBuffer();

      // バッファがない、またはデータが同じならアニメーション不要
      if (
        !bufferPlayer ||
        (bufferPlayer.totalExp === realPlayer.totalExp &&
          bufferPlayer.level === realPlayer.level)
      ) {
        setDisplayPlayer(realPlayer);
        setIsDataLoading(false);
        if (bufferPlayer) clearBuffer(); // 不要なバッファは消す
        return;
      }

      // アニメーション開始：まずはバッファ（古い状態）を表示
      setDisplayPlayer(bufferPlayer);
      setIsDataLoading(false);

      let currentExp = bufferPlayer.exp;
      let currentLevel = bufferPlayer.level;
      const targetTotalExp = realPlayer.totalExp;
      let currentTotalExp = bufferPlayer.totalExp;

      const animate = () => {
        // 差分を計算して少しずつ増やす
        const diff = targetTotalExp - currentTotalExp;

        if (diff <= 0) {
          // 完了
          setDisplayPlayer(realPlayer);
          clearBuffer();
          return;
        }

        // 加算スピード（残りの5%ずつ近づける、最低1）
        const step = Math.max(1, Math.ceil(diff * 0.05));
        currentTotalExp += step;
        currentExp += step;

        // レベルアップ判定
        const required = getRequiredExp(currentLevel);
        if (currentExp >= required) {
          currentExp -= required;

          // レベルアップエフェクトを表示
          setIsLevelingUp(true);
          setTimeout(() => {
            setIsLevelingUp(false);
          }, 2000); // 2秒間表示

          // レベル9 -> 10への進化判定
          if (currentLevel === 9) {
            currentLevel++;

            // 進化演出開始
            console.log("✨ Evolution sequence started!");
            setIsEvolving(true);

            // 状態更新（レベル10になった瞬間を表示）
            setDisplayPlayer({
              ...realPlayer,
              level: currentLevel,
              exp: currentExp,
              totalExp: currentTotalExp,
            });

            // アニメーション一時停止して演出を見せる
            setTimeout(() => {
              console.log("✨ Evolution sequence ended");
              setIsEvolving(false);
              // 演出終了後にアニメーション再開
              requestRef.current = requestAnimationFrame(animate);
            }, 3000); // 3秒間演出

            return; // ここで一旦ループを抜ける
          }

          currentLevel++;
        }

        // 状態更新
        setDisplayPlayer({
          ...realPlayer, // 名前などは最新を使う
          level: currentLevel,
          exp: currentExp,
          totalExp: currentTotalExp,
        });

        requestRef.current = requestAnimationFrame(animate);
      };

      // 少し待ってからアニメーション開始
      const timer = setTimeout(() => {
        requestRef.current = requestAnimationFrame(animate);
      }, 500);

      return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        clearTimeout(timer);
      };
    };

    loadAndAnimate();
  }, [loading, user]);

  return {
    displayPlayer,
    isDataLoading,
    isEvolving,
    isLevelingUp,
  };
}
