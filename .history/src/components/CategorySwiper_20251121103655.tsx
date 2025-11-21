'use client';

import { useMemo, useRef, useState } from "react";
import styles from "./CategorySwiper.module.css";

type Props = {
    data: { 
        key: string; 
        label: string; 
        children: readonly { key: string; label: string }[] 
    }[];
    onPick: (category: string, sub: string) => void; // 選択結果を親へ返す
};

export default function CategorySwiper({ data, onPick }: Props) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(0);
    const pages = data.length;

    const onScroll = () => {
        const el = trackRef.current;
        if (!el) return;
        const idx = Math.round(el.scrollLeft / el.clientWidth);
        if (idx !== page) setPage(Math.max(0, Math.min(pages - 1, idx)));
    };

    const go = (dir: -1 | 1) => {
        const el = trackRef.current;
        if (!el) return;
        const next = Math.max(0, Math.min(pages - 1, page + dir));
        el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    };

    const dots = useMemo(() => Array.from({ length: pages }), [pages]);

    return (
        <div className={styles.wrapper}>
            <div className={styles.headerRow}>
                <h3 className={styles.title}>{data[page]?.label ?? "カテゴリ"}</h3>
                <div className={styles.arrowGroup}>
                    <button className={styles.arrowBtn} onClick={() => go(-1)} disabled={page === 0} aria-label="前へ">←</button>
                    <button className={styles.arrowBtn} onClick={() => go(1)} disabled={page === pages - 1} aria-label="次へ">→</button>
                </div>
            </div>

            <div
                ref={trackRef}
                onScroll={onScroll}
                className={styles.track}
            >
                <div className={styles.trackInner}>
                    {data.map((cat) => (
                        <section key={cat.key} className={styles.slide} aria-label={cat.label}>
                            <div className={styles.slidePanel}>
                                <div className={styles.grid}>
                                    {cat.children.map((child) => (
                                        <button
                                            key={child.key}
                                            type="button"
                                            className={styles.subBtn}
                                            onClick={() => onPick(cat.label, child.label)}
                                        >
                                            {child.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>
                    ))}
                </div>
            </div>

            <div className={styles.dots}>
                {dots.map((_, i) => (
                    <span key={i} className={`${styles.dot} ${i === page ? styles.dotActive : ""}`} />
                ))}
            </div>
        </div>
    );
}
