'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function HomePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // ⏱ loading時間計測用
    const loadingStartRef = useRef<number | null>(null);

    // loading開始時刻を記録
useEffect(() => {
  if (typeof window === 'undefined') return;

  const cachedAuth = localStorage.getItem('authUser');
  const cachedProfile = cachedAuth
    ? localStorage.getItem(`userDoc_${JSON.parse(cachedAuth).uid}`)
    : null;

  if (cachedAuth && cachedProfile) {
    setUser(JSON.parse(cachedAuth));
    setProfile(JSON.parse(cachedProfile));
    setLoading(false); // ← ここがポイント
  }

  const unsubscribe = onAuthStateChanged(auth, async (u) => {
    if (!u) {
      router.push('/login');
      return;
    }

    // 後から正しい情報を上書き
    const authData = { uid: u.uid, email: u.email, displayName: u.displayName || null };
    localStorage.setItem('authUser', JSON.stringify(authData));
    setUser(authData);

    const { doc, getDoc, setDoc, updateDoc, serverTimestamp } = await import('firebase/firestore');
    const userRef = doc(db, 'users', u.uid);
    const snap = await getDoc(userRef);
    const data = snap.exists() ? snap.data() : {
      username: u.email.split('@')[0],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    localStorage.setItem(`userDoc_${u.uid}`, JSON.stringify(data));
    setProfile(data);
    setLoading(false);
  });

  return () => unsubscribe();
}, [router]);

    const handleLogout = async () => {
        await signOut(auth);
        localStorage.removeItem('authUser');
        router.push('/login');
    };

    if (loading) {
        return (
            <p className="p-4 text-gray-500 animate-pulse">読み込み中...</p>
        );
    }

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
