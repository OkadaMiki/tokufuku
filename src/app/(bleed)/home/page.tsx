"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import DailyChallengeModal from "@/components/features/daily-challenge/DailyChallengeModal";
import HomeScene from "@/components/features/home/HomeScene";
import LevelGauge from "@/components/features/home/LevelGauge";
import FooterNav from "@/components/layout/FooterNav";
import LoadingMessage from "@/components/ui/LoadingMessage";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { auth } from "@/lib/firebase";
import {
  clearBuffer,
  getRequiredExp,
  loadBuffer,
  loadPlayer,
} from "@/lib/level";
import type { PlayerData } from "@/lib/playerData";
import styles from "./page.module.css";

export default function HomePage() {
  const wall = "/assets/walls/default_wall.jpg";
  const floor = "/assets/floors/default_floor.jpg";

  const router = useRouter();
  const { user, loading } = useAuthGuard({ requireLogin: true });
  const [open, setOpen] = useState(false);

  // 表示用のプレイヤーデータ（アニメーションで変化する）
  const [displayPlayer, setDisplayPlayer] = useState<PlayerData | null>(null);

  // アニメーション制御用
  const requestRef = useRef<number>(null);

  useEffect(() => {
    // 初期ロード
    const realPlayer = loadPlayer();
    const bufferPlayer = loadBuffer();

    // バッファがない、またはデータが同じならアニメーション不要
    if (
      !bufferPlayer ||
      (bufferPlayer.totalExp === realPlayer.totalExp &&
        bufferPlayer.level === realPlayer.level)
    ) {
      setDisplayPlayer(realPlayer);
      if (bufferPlayer) clearBuffer(); // 不要なバッファは消す
      return;
    }

    // アニメーション開始：まずはバッファ（古い状態）を表示
    setDisplayPlayer(bufferPlayer);

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
  }, []);

  if (loading || !displayPlayer) return <LoadingMessage />;

  return (
    <>
      <HomeScene wallUrl={wall} floorUrl={floor} floorHeightPct={210}>
        <div className={styles.page}>
          <div className={styles.stack}>
            <LevelGauge player={displayPlayer} />

            <button
              type="button"
              onClick={() => setOpen(true)}
              className={`${styles.primaryButton} ${styles.openChallenge}`}
            >
              チャレンジへ
            </button>
            <DailyChallengeModal
              open={open}
              onClose={() => setOpen(false)}
              onGoFeed={() => {
                /* ご飯画面へ */
              }}
              onGoUranai={() => {
                /* おみくじ画面へ */
                router.push("/fortune");
              }}
              onGoRecord={() => router.push("/record")}
              state={displayPlayer.dailyChallenge}
            />
          </div>
          <FooterNav />
        </div>
      </HomeScene>
    </>
  );
}
