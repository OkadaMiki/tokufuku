import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";

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
          const userDocRef = doc(db, "users", u.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUser({
              uid: u.uid,
              email: u.email,
              ...userDoc.data(),
            });
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
