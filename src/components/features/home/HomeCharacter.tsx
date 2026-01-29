"use client";

import Image from "next/image";
import styles from "./HomeCharacter.module.css";

type Props = {
  level: number;
  isEvolving: boolean;
  isLevelingUp: boolean;
  onFeed?: () => void;
};

export default function HomeCharacter({
  level,
  isEvolving,
  isLevelingUp,
  onFeed,
}: Props) {
  // キャラクター画像の決定
  let charImage = "/assets/characters/baby/pink.svg";
  if (level >= 10) {
    charImage = "/assets/characters/child/blue.svg";
  }

  const handleFeed = () => {
    console.log("ごはん！");
    if (onFeed) onFeed();
  };

  return (
    <div className={styles.charWrap}>
      {!isLevelingUp && (
        <button
          type="button"
          className={styles.gohanBtn}
          onClick={handleFeed}
          aria-label="ご飯をあげる"
        >
          <Image
            src="/assets/btns/gohan.svg"
            alt=""
            fill
            sizes="160px, 192px"
            priority
          />
        </button>
      )}

      <div
        className={`${styles.charSlot} ${isEvolving ? styles.evolving : ""}`}
      >
        <Image
          src={charImage}
          alt="キャラクター"
          fill
          sizes="200px, 180px"
          priority
          unoptimized
        />
      </div>
    </div>
  );
}
