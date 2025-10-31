type Props = { value: number; max: number };

export default function Gauge({ value, max = 100 }: Props) {
    // 一旦レベル更新数値を100としている
    const percent = Math.min(100, Math.round((value / max) * 100));
}
