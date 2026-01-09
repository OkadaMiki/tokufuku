"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import AuthInput from "@/components/ui/AuthInput";
import LoadingMessage from "@/components/ui/LoadingMessage";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { auth } from "@/lib/firebase";

import styles from "../auth.module.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const mail = searchParams.get("mail");
    const pass = searchParams.get("pass");
    if (mail) setEmail(mail);
    if (pass) setPassword(pass);
  }, [searchParams]);

  const { loading: checking } = useAuthGuard({
    requireLogin: false,
    redirectTo: "/home",
  });

  if (checking) return <LoadingMessage text="ログイン状態を確認中..." />;

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/home");
    } catch (err: unknown) {
      console.error(err);
      setError("ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>ログイン</h1>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.inputGroup}>
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
          text="ログイン"
          onClick={handleLogin}
          loading={loading}
          disabled={loading}
          className={styles.button}
        />

        <div className={styles.linkArea}>
          <p className={styles.link}>
            アカウントをお持ちでない方 <br />
            <a href="/signup" className={styles.linkButton}>
              新規登録はこちら
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingMessage text="読み込み中..." />}>
      <LoginForm />
    </Suspense>
  );
}
