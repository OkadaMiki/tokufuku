import styles from "./LevelGauge.module.css";

type Props = {
    level: number;
    name: string;
    value: number;   // 現在の経験値
    max?: number;    // レベルアップに必要な値（既定 100）
    // ?はあってもなくてもいい。
};



export default function LevelGauge({ level, name, value, max = 100 }: Props) {
    const clampedNow = Math.max(0, Math.min(value, max));
    const percent = max <= 0 ? 100 : Math.round((clampedNow / max) * 100);
    const remain = Math.max(0, max - clampedNow);

    return (
        <div className={styles.levelGauge}>
            <div className={styles.nameTag}>
                <div className={styles.levelBadge} aria-label={`レベル ${level}`}>
                    <span className={styles.levelNum}>{level}</span>
                </div>
                <h2 className={styles.name} title={name}>{name}</h2>
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
                あと
                <strong className={styles.pointNum}>
                    {remain.toLocaleString()}
                </strong>
                ポイント
            </p>
        </div>
    )
}
