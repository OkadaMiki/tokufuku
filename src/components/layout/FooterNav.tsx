"use client";
import Link from "next/link";
import styles from "./Footer.module.css";

type Props = {
  className?: string;
};

export default function Footer({ className }: Props) {
  return (
    <footer className={`${styles.footer} ${className || ""}`}>
      <Link href="/list" className={styles.box}>
        <img src="/assets/footer/log.svg" alt="" />
        <span>ログ</span>
      </Link>
      <Link href="/record" className={styles.box}>
        <img src="/assets/footer/record.svg" alt="" />
        <span>記録</span>
      </Link>
      <Link href="/home" className={styles.box}>
        <img src="/assets/footer/home.svg" alt="" />
        <span>ホーム</span>
      </Link>
      <Link href="/care" className={styles.box}>
        <img src="/assets/footer/dressup.svg" alt="" />
        <span>着せ替え</span>
      </Link>
      <Link href="/user" className={styles.box}>
        <img src="/assets/footer/menu.svg" alt="" />
        <span>メニュー</span>
      </Link>
    </footer>
  );
}
