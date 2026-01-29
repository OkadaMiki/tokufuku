"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import FooterNav from "@/components/layout/FooterNav";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { auth } from "@/lib/firebase";
import { clearAllLocalData } from "@/lib/level/storage";

export default function UserPage() {
  const router = useRouter();
  const handleLogout = async () => {
    await signOut(auth);
    clearAllLocalData(); // ログアウト時はすべてのローカルデータを削除
    router.push("/login");
  };
  const { user } = useAuthGuard({ requireLogin: true });

  return (
    <>
      <p>ユーザー名：{user?.username}</p>
      <PrimaryButton text="ログアウト" onClick={handleLogout} color="red" />
      <FooterNav />
    </>
  );
}
