import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { clearPlayer, savePlayer } from "@/lib/level/storage";
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
          // ※ 注意: これによりオフライン時の動作が制限される可能性があるが、
          //   「DBから持ってくる」という要件を優先する。
          clearPlayer();

          const userDocRef = doc(db, "users", u.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUser({
              uid: u.uid,
              email: u.email,
              ...userDoc.data(),
            });

            // ローカルストレージと同期 (DBのデータが正なら上書き)
            const data = userDoc.data();
            if (validatePlayerData(data)) {
              savePlayer(data);
              console.log("🔄 Synced local player data with Firestore");
            } else {
              console.warn("⚠️ Firestore data is invalid, skipping sync");
            }
          } else {
            // Firestoreにデータがない場合はAuth情報だけ返す
            setUser({ uid: u.uid, email: u.email });
          }
        } catch (error) {
          console.error("ユーザー情報の取得に失敗しました:", error);
          setUser({ uid: u.uid, email: u.email });
        }
      } else {
        setUser(null);
      }

      setLoading(false);

      // 計測終了
      const end = performance.now();
      const elapsed = Math.round(end - start);
      console.log(`Loading finished: ${elapsed} ms`);
    });

    return () => unsubscribe();
  }, [router, requireLogin, redirectTo]);

  return { user, loading };
}
