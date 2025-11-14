'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useState } from "react";

import LoadingMessage from "@/components/LoadingMessage";
import PrimaryButton from "@/components/PrimaryButton";
import FooterNav from '@/components/FooterNav';
import DailyChallengeModal from '@/components/DailyChallengeModal';
import LevelGauge from '@/components/LevelGauge';
import { loadPlayer } from "@/lib/levelSystem";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function HomePage() {
    const router = useRouter();
    const player = loadPlayer();
    const { user, loading } = useAuthGuard({ requireLogin: true });
    const [open, setOpen] = useState(false);


    if (loading) return <LoadingMessage />;

    const handleLogout = async () => {
        await signOut(auth);
        localStorage.removeItem('authUser');
        router.push('/login');
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen space-y-6">
            <div className="flex space-x-4">
                <LevelGauge player={player} />
                {/* <PrimaryButton
                    text="記録ページへ"
                    onClick={() => router.push('/record')}
                    color="green"
                    /> */}

                <p>こんにちは、{user?.username} さん</p>

                <button
                    onClick={() => setOpen(true)}
                    style={{
                        padding: "10px 14px", borderRadius: 10, border: "1px solid #d1d5db",
                        background: "#fff", width: "fit-content", cursor: "pointer"
                    }}
                >
                    まいにちチャレンジを開く
                </button>
                <DailyChallengeModal
                    open={open}
                    onClose={() => setOpen(false)}
                    onGoFeed={() => {/* ご飯画面へ */ }}
                    onGoUranai={() => {/* おみくじ画面へ */ }}
                    onGoRecord={() => router.push('/record')}
                    state={{ completed: { feed: false, uranai: true, record: false } }}
                />
                {/* <PrimaryButton
                    text="記録一覧ページへ"
                    onClick={() => router.push('/list')}
                    color="green"
                /> */}
                <PrimaryButton
                    text="ログアウト"
                    onClick={handleLogout}
                    color="red"
                />
            </div>
            <FooterNav />
        </div>
    );
}
