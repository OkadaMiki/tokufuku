"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Footer.module.css";

type Props = {
  className?: string;
};


const items = [
  { href: "/list", label: "ログ", icon: "/assets/footer/log.svg" },
  { href: "/record", label: "記録する", icon: "/assets/footer/record.svg" },
  { href: "/home", label: "ホーム", icon: "/assets/footer/home.svg" },
  { href: "/care", label: "着せ替え", icon: "/assets/footer/dressup.svg" },
  { href: "/user", label: "メニュー", icon: "/assets/footer/menu.svg" },
] as const;

export default function Footer({ className }: Props) {
  const pathname = usePathname();
  return (
    <footer className={`${styles.footer} ${className || ""}`}>
      <nav aria-label="フッターナビゲーション">
        <ul className={styles.list}>
          {items.map((item) => {
            const isCurrent =
              pathname === item.href ||
              (pathname?.startsWith(`${item.href}/`) ?? false);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={styles.box}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  <img
                    src={item.icon}
                    alt=""
                    aria-hidden="true"
                    className={styles.icon}
                  />
                  <span className={styles.label}>{item.label}</span>
                </Link>
              </li>
            );
          })}
          {/* <Link href="/list" className={styles.box}>
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
          </Link> */}
        </ul>
      </nav>
    </footer>
  );
}
