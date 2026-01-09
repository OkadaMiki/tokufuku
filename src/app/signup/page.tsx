"use client";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthInput from "@/components/ui/AuthInput";
import LoadingMessage from "@/components/ui/LoadingMessage";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { auth, db } from "@/lib/firebase";

import styles from "../auth.module.css";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { loading: checking } = useAuthGuard({
    requireLogin: false,
    redirectTo: "/home",
  });
  if (checking) return <LoadingMessage text="ログイン状態を確認中..." />;

  const handleSignup = async () => {
    setError("");
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      
      // 初期プレイヤーデータを作成
      const initialPlayerData = {
        // ユーザー情報
        username,
        email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // プレイヤーデータ
        name: username || "プレイヤー",
        level: 1,
        exp: 0,
        totalExp: 0,
        dailyChallenge: { completed: {} },
        lastLoginDate: new Date().toISOString(),
      };
      
      await setDoc(doc(db, "users", uid), initialPlayerData);
      router.push("/home");
    } catch (err: unknown) {
      console.error(err);
      setError("登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>新規登録</h1>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.inputGroup}>
          <AuthInput
            placeholder="ユーザー名"
            value={username}
            onChange={setUsername}
            className={styles.input}
          />
          <AuthInput
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={setEmail}
            className={styles.input}
          />
          <AuthInput
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={setPassword}
            className={styles.input}
          />
        </div>

        <PrimaryButton
          text="登録"
          onClick={handleSignup}
          loading={loading}
          disabled={loading}
          color="green"
          className={styles.button}
        />

        <p className={styles.helperText}>パスワードは半角英数字6文字以上</p>

        <div className={styles.linkArea}>
          <p className={styles.link}>
            すでにアカウントをお持ちの方 <br />
            <button
              type="button"
              onClick={() => router.push("/login")}
              className={styles.linkButton}
            >
              ログインはこちら
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
