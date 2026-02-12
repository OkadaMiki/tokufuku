"use client";

import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { DebugResetButton } from "@/components/features/debug/DebugResetButton";

export default function Page() {
  const { user } = useAuthGuard({ requireLogin: false, redirectIfLoggedIn: false });

  return (
    <>
      <div style={{ padding: "20px" }}>
        {user?.uid && (
          <div style={{ marginBottom: "20px", padding: "10px", border: "1px dashed #ff6b6b" }}>
            <h3 style={{ marginBottom: "10px" }}>デモ用リセットボタン</h3>
            <p style={{ fontSize: "12px", marginBottom: "10px" }}>
              進捗を Lv1 / XP90 / 占い未実施 にリセットします。
            </p>
            <DebugResetButton uid={user.uid} />
          </div>
        )}
      </div>
    </>
  );
}
