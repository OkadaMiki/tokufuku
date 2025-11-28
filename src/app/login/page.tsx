"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthInput from "@/components/ui/AuthInput";
import LoadingMessage from "@/components/ui/LoadingMessage";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="flex flex-col items-center justify-center h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">ログイン</h1>

      <AuthInput
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={setEmail}
      />
      <AuthInput
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={setPassword}
      />

      <PrimaryButton
        text="ログイン"
        onClick={handleLogin}
        loading={loading}
        disabled={loading}
      />

      <a href="/signup">サインアップ</a>

      {error && <p className="text-red-500 mt-3">{error}</p>}
    </div>
  );
}
