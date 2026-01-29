"use client";

import styles from "./FortuneCardSelector.module.css";

type Props = {
  selectedCard: number | null;
  onSelect: (index: number) => void;
  onConfirm: () => void;
};

export default function FortuneCardSelector({
  selectedCard,
  onSelect,
  onConfirm,
}: Props) {
  const cards = [1, 2, 3, 4, 5, 6];

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      onSelect(index);
    }
  };

  return (
    <>
      <div className={styles.cardContainer}>
        {cards.map((i) => (
          <button
            type="button"
            key={i}
            className={`${styles.card} ${selectedCard === i ? styles.selected : ""}`}
            onClick={() => onSelect(i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          />
        ))}
      </div>
      {selectedCard !== null && (
        <button
          type="button"
          className={styles.confirmButton}
          onClick={onConfirm}
        >
          これにする
        </button>
      )}
    </>
  );
}
