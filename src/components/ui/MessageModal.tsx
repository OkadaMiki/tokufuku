"use client";

import { useEffect } from "react";
import styles from "./MessageModal.module.css";

type Props = {
    open: boolean;
    title: string;
    message: string;
    onClose: () => void;
    variant?: "success" | "error";
};

export default function MessageModal({
    open,
    title,
    message,
    onClose,
    variant = "success",
}: Props) {
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className={styles.backdrop}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={onClose}
        >
            <div
                className={`${styles.panel} ${variant === "error" ? styles.error : styles.success}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                </div>

                <p className={styles.message}>{message}</p>

                <div className={styles.footer}>
                    <button
                        type="button"
                        className={styles.button}
                        onClick={onClose}
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
}
