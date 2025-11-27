"use client";

import FooterNav from "@/components/FooterNav";
import PrimaryButton from "@/components/PrimaryButton";
import styles from "./page.module.css";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import type { PlayerData } from "@/lib/playerData";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

type Props = {
    player: PlayerData;
};

export default function UserPage() {
    const handleLogout = async () => {
        const router = useRouter();

        await signOut(auth);
        localStorage.removeItem("authUser");
        router.push("/login");
    };
    const { user } = useAuthGuard({ requireLogin: true });


    return (
        <>
            <p>ユーザー名：{user?.username}</p>
            <PrimaryButton text="ログアウト" onClick={handleLogout} color="red" />
            <FooterNav />

        </>

    )
}