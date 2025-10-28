'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth,db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function HomePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (u) => {
            if (!u) {
                router.push('/login'); // 未ログインならログインページへ
                return;
            }
            setUser(u);

            // Firestoreからユーザー情報を取得
            const userRef = doc(db, 'users', u.uid);
            const snap = await getDoc(userRef);
            if (snap.exists()) {
                setProfile(snap.data());
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [router]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    if (loading) return <p className="p-4">読み込み中...</p>;

    console.log(user);

    return (
        <div className="flex flex-col items-center justify-center h-screen space-y-6">
            <h1 className="text-2xl font-bold">ホーム</h1>

            <p>こんにちは、{profile?.username || user?.email} さん</p>

            <div className="flex space-x-4">
                <button
                    onClick={() => router.push('/record')}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    記録ページへ
                </button>

                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    ログアウト
                </button>
            </div>
        </div>
    );
}
