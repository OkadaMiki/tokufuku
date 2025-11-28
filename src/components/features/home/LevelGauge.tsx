import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getRemainingExp, getRequiredExp } from "@/lib/level";
import type { PlayerData } from "@/lib/playerData";
import styles from "./LevelGauge.module.css";

type Props = {
  player: PlayerData;
};

export default function LevelGauge({ player }: Props) {
  const { user } = useAuthGuard({ requireLogin: true });
  if (!player) return null;
  const level = player.level;
  const name = player.name;
  const value = player.exp;
  const max = getRequiredExp(player.level);
  const remain = getRemainingExp(player);
  const percent = Math.round((value / max) * 100);
  const clampedNow = Math.max(0, Math.min(value, max));

  return (
    <div className={styles.levelGauge}>
      <div className={styles.nameTag}>
        <div
          className={styles.levelBadge}
          role="img"
          aria-label={`レベル ${level}`}
        >
          <span className={styles.levelNum}>{level}</span>
        </div>
        <h2 className={styles.name} title={name}>
          {user?.username}
        </h2>
      </div>

      <div
        className={styles.progress}
        role="progressbar"
        aria-label="つぎのレベルアップまでの進捗"
        aria-valuenow={clampedNow}
        aria-valuemin={0}
        aria-valuemax={max <= 0 ? 1 : max}
      >
        <span
          className={styles.progressFill}
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className={styles.caption}>
        次のレベルまで あと
        <strong className={styles.pointNum}>{remain.toLocaleString()}</strong>
        ポイント
      </p>
    </div>
  );
}
