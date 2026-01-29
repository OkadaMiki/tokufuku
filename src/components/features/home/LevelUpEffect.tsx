"use client";

import Image from "next/image";
import styles from "./LevelUpEffect.module.css";

type Props = {
  visible: boolean;
};

export default function LevelUpEffect({ visible }: Props) {
  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        {/* 左の矢印 */}
        <div className={`${styles.arrow} ${styles.arrowLeft}`}>
          <Image
            src="/assets/union.png"
            alt=""
            width={48}
            height={72}
            priority
          />
        </div>

        {/* UP! テキスト */}
        <div className={styles.upText}>UP!</div>

        {/* 右上の矢印 */}
        <div className={`${styles.arrow} ${styles.arrowRightTop}`}>
          <Image
            src="/assets/union.png"
            alt=""
            width={40}
            height={60}
            priority
          />
        </div>

        {/* 右下の矢印 */}
        <div className={`${styles.arrow} ${styles.arrowRightBottom}`}>
          <Image
            src="/assets/union.png"
            alt=""
            width={56}
            height={84}
            priority
          />
        </div>
      </div>
    </div>
  );
}
