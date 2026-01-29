"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useHomeAnimation } from "@/hooks/home/useHomeAnimation";

import DailyChallengeModal from "@/components/features/daily-challenge/DailyChallengeModal";
import HomeScene from "@/components/features/home/HomeScene";
import LevelGauge from "@/components/features/home/LevelGauge";
import HomeCharacter from "@/components/features/home/HomeCharacter";
import LevelUpEffect from "@/components/features/home/LevelUpEffect";
import FooterNav from "@/components/layout/FooterNav";
import LoadingMessage from "@/components/ui/LoadingMessage";

import styles from "./page.module.css";

export default function HomePage() {
  const wall = "/assets/walls/default_wall.jpg";
  const floor = "/assets/floors/default_floor.jpg";

  const router = useRouter();
  const { user, loading } = useAuthGuard({ requireLogin: true });
  const [open, setOpen] = useState(false);

  // アニメーションロジックはカスタムフックに委譲
  const { displayPlayer, isDataLoading, isEvolving, isLevelingUp } =
    useHomeAnimation(user, loading);

  if (loading || isDataLoading || !displayPlayer) return <LoadingMessage />;

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
              <Image
                src={"/assets/btns/challengebtn.svg"}
                alt={"まいにちチャレンジへ"}
                width={96}
                height={96}
              />
            </button>
            <DailyChallengeModal
              open={open}
              onClose={() => setOpen(false)}
              onGoFeed={() => {
                /* ご飯画面へ */
              }}
              onGoUranai={() => {
                router.push("/fortune");
              }}
              onGoRecord={() => router.push("/record")}
              state={displayPlayer.dailyChallenge}
            />
          </div>

          {/* レベルアップエフェクト */}
          <LevelUpEffect visible={isLevelingUp} />

          {/* キャラクター（ご飯ボタン含む） */}
          <HomeCharacter
            level={displayPlayer.level}
            isEvolving={isEvolving}
            isLevelingUp={isLevelingUp}
            onFeed={() => {
              // ここに「ご飯をあげる処理」を後で追加
              console.log("ごはん！");
            }}
          />

          <FooterNav />
        </div>
      </HomeScene>
    </>
  );
}
