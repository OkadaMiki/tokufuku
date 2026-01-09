import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { clearPlayer, savePlayer, syncPlayerData } from "@/lib/level/storage";
import { validatePlayerData } from "@/lib/playerData";

export function useAuthGuard({
  requireLogin = false,
  redirectTo = "/home",
}: {
  requireLogin?: boolean;
  redirectTo?: string;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 開発用load時間計測
    const start = performance.now(); // 計測開始
    console.log("Loading started");

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (requireLogin && !u) {
        router.push("/login");
        setUser(null);
        setLoading(false);
        return;
      }

      if (!requireLogin && u) {
        router.push(redirectTo);
        setLoading(false);
        return;
      }

      if (u) {
        try {
          // ログイン時（初期ロード時）に一度ローカルをクリアして整合性を担保
          // 新しいsyncPlayerData関数を使用してFirestoreと同期
          clearPlayer();

          // Firestoreと同期（Firestoreを優先）
          const playerData = await syncPlayerData(u.uid);
          
          setUser({
            uid: u.uid,
            email: u.email,
            ...playerData,
          });
          
          console.log("🔄 User data synced successfully");
        } catch (error) {
          console.error("ユーザー情報の取得に失敗しました:", error);
          setUser({ uid: u.uid, email: u.email });
        }
      } else {
        setUser(null);
      }

      // Calculate remaining time to satisfy the minimum 1s requirement
      const now = performance.now();
      const elapsedSoFar = now - start;
      const minDuration = 1000;
      const remaining = minDuration - elapsedSoFar;

      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }

      setLoading(false);

      // 計測終了
      const end = performance.now();
      const totalElapsed = Math.round(end - start);
      console.log(`Loading finished: ${totalElapsed} ms`);
    });

    return () => unsubscribe();
  }, [router, requireLogin, redirectTo]);

  return { user, loading };
}
