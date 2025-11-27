"use client";
import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Link href="/list" className={styles.box}></Link>
      <Link href="/record" className={styles.box}></Link>
      <Link href="/home" className={styles.box}></Link>
      <Link href="/character" className={styles.box}></Link>
      <Link href="/user" className={styles.box}></Link>
    </footer>
  );
}
