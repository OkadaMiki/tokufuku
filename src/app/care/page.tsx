"use client";

import FooterNav from "@/components/layout/FooterNav";
import styles from "./page.module.css";
import Image from 'next/image';
import HomeScene from "@/components/features/home/HomeScene";
import { useState } from "react";


export default function BreedingPage() {
  const wall = "/assets/walls/default_wall.jpg";
  const floor = "/assets/floors/default_floor.jpg";
  const [open, setOpen] = useState(false);


  return (
    <>
      <HomeScene wallUrl={wall} floorUrl={floor} floorHeightPct={210}>
        <div className={styles.page}>
          <h1>いのちをお世話しよう！</h1>
          <div className={styles.stack}>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={`${styles.primaryButton} ${styles.openWash}`}
            >
              洗う
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={`${styles.primaryButton} ${styles.openDressUp}`}
            >
              きせかえ
            </button>
          </div>
          <div className={styles.charSlot}>
            <Image
              src="/assets/characters/baby/pink.svg"
              alt="ピンクの小さなあかちゃんのいのち"
              width={200}
              height={180}
              priority
            />
          </div>
          <FooterNav />
        </div>
      </HomeScene>
    </>
  );
}
