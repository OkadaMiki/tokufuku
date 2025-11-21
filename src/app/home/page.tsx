"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DailyChallengeModal from "@/components/DailyChallengeModal";
import FooterNav from "@/components/FooterNav";
import LevelGauge from "@/components/LevelGauge";
import LoadingMessage from "@/components/LoadingMessage";
import PrimaryButton from "@/components/PrimaryButton";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { auth } from "@/lib/firebase";
import { loadPlayer } from "@/lib/levelSystem";
import styles from "./page.module.css";

export default function HomePage() {
  const router = useRouter();
  const player = loadPlayer();
  const { user, loading } = useAuthGuard({ requireLogin: true });
  const [open, setOpen] = useState(false);

  if (loading) return <LoadingMessage />;

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("authUser");
    router.push("/login");
  };

  return (
    <div className={styles.page}>
      <div className={styles.stack}>
        <LevelGauge player={player} />

        <p className={styles.greeting}>こんにちは、{user?.username} さん</p>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className={styles.primaryButton}
        >
          まいにちチャレンジを開く
        </button>
        <DailyChallengeModal
          open={open}
          onClose={() => setOpen(false)}
          onGoFeed={() => {
            /* ご飯画面へ */
          }}
          onGoUranai={() => {
            /* おみくじ画面へ */
          }}
          onGoRecord={() => router.push("/record")}
          state={player.dailyChallenge}
        />
        <PrimaryButton text="ログアウト" onClick={handleLogout} color="red" />
      </div>
      <FooterNav />
    </div>
  );
}
