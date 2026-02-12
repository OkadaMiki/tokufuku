"use client";

import { useState } from "react";
import { resetPlayerProgress } from "@/lib/level/debug";

interface DebugResetButtonProps {
  uid: string;
  targetLevel?: number;
  targetExp?: number;
  label?: string;
  className?: string;
}

export const DebugResetButton = ({
  uid,
  targetLevel = 1,
  targetExp = 90, // level 1 max is ~115, so 90 is close to level up
  label = "デモ用リセット",
  className,
}: DebugResetButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!confirm("進捗をリセットしますか？（デモ用）\nレベル1、占い未実施状態に戻ります。")) return;
    
    setLoading(true);
    // レベル1、経験値90、占い未実施にリセット
    const success = await resetPlayerProgress(uid, targetLevel, targetExp, true);
    setLoading(false);
    
    if (success) {
      // ローカルストレージも念のためクリア（再ログインさせるわけではないので、必要なものだけ消すのが理想だが、
      // 開発用デバッグボタンなので全消去でもOK）
      try {
        localStorage.removeItem("player_cache");
        localStorage.removeItem("player_buffer");
        // 他のキーがあればここに追加
      } catch (e) {
        console.error("Local storage clear failed", e);
      }
      
      alert("リセットしました。ホームに戻ります。");
      window.location.href = "/home";
    } else {
      alert("リセットに失敗しました。");
    }
  };

  return (
    <button 
      type="button"
      onClick={handleReset} 
      disabled={loading}
      className={className}
      style={!className ? { 
        padding: "8px 16px", 
        background: "#ff6b6b", 
        color: "white", 
        borderRadius: "20px",
        border: "none",
        fontWeight: "bold",
        fontSize: "12px",
        cursor: "pointer",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
      } : undefined}
    >
      {loading ? "処理中..." : label}
    </button>
  );
};
