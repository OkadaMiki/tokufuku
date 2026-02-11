import Image from "next/image";

import styles from "./styles.module.css";

export default function LoadingMessage({
  text = "読み込み中...",
}: {
  text?: string;
}) {
  return (
    <div className={styles.main}>
      <Image
        src="/assets/characters/baby/pink.svg"
        alt="Character"
        width={56}
        height={56}
        className={styles.charImage}
      />
      <p className="p-4 text-gray-500 animate-pulse text-center">{text}</p>
    </div>
  );
}
