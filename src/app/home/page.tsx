'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

import LoadingMessage from "@/components/LoadingMessage";
import PrimaryButton from "@/components/PrimaryButton";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import FooterNav from '@/components/FooterNav';

export default function HomePage() {
    const router = useRouter();
    const { user, loading } = useAuthGuard({ requireLogin: true });

    if (loading) return <LoadingMessage />;

    const handleLogout = async () => {
        await signOut(auth);
        localStorage.removeItem('authUser');
        router.push('/login');
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen space-y-6">
            <h1 className="text-2xl font-bold">ホーム</h1>
            <p>こんにちは、{user?.username} さん</p>

            <div className="flex space-x-4">
                <PrimaryButton
                    text="記録ページへ"
                    onClick={() => router.push('/record')}
                    color="green"
                />
                <PrimaryButton
                    text="記録一覧ページへ"
                    onClick={() => router.push('/list')}
                    color="green"
                />
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
