"use client";

import type React from "react";
import styles from "./HomeScene.module.css";

type Props = {
  wallUrl: string;
  floorUrl: string;
  floorHeightPct?: number;
  children?: React.ReactNode;
};

// CSS カスタムプロパティ用（--xxx は文字列）
type SceneVars = {
  [key: `--${string}`]: string;
};

export default function HomeScene({
  wallUrl,
  floorUrl,
  floorHeightPct = 32,
  children,
}: Props) {
  const sceneStyle: SceneVars = {
    "--wall-url": `url(${wallUrl})`,
    "--floor-url": `url(${floorUrl})`,
    "--floor-h": `${floorHeightPct}px`,
  };

  return (
    <div className={styles.scene} style={sceneStyle}>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
