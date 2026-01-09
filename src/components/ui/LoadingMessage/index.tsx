
import styles from "./styles.module.css";

export default function LoadingMessage({
  text = "読み込み中...",
}: {
  text?: string;
}) {
  return (
    <div className={styles.main}>
      <p className="p-4 text-gray-500 animate-pulse text-center">{text}</p>
    </div>
  );
}
