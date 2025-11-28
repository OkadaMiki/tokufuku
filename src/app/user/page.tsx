"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import FooterNav from "@/components/layout/FooterNav";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { auth } from "@/lib/firebase";
import { clearPlayer } from "@/lib/level/storage";

export default function UserPage() {
  const router = useRouter();
  const handleLogout = async () => {
    await signOut(auth);
    clearPlayer();
    // localStorage.removeItem("authUser"); // authUserは使っていないようだが念のため残すか、clearPlayerで十分か？
    // 元のコードにあったので残すが、playerデータはclearPlayerで消す
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
